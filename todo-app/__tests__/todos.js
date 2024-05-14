const request = require("supertest");
const cheerio = require("cheerio");

const db = require("../models/index");
const app = require("../app");

let server, agent;

function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Todo Application", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.error(error);
    }
  });

  beforeEach(async () => {
    // Reset the database state before each test
    await db.Todo.destroy({ where: {} });
  });

  test("create a new todo with today's date as due date", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);

    const response = await agent.post("/todo").send({
      _csrf: csrfToken,
      title: "Test Todo",
      dueDate: new Date().toISOString(),
      completed: false,
    });

    expect(response.statusCode).toBe(302);
  });

  test("create a new todo with a future due date", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const response = await agent.post("/todo").send({
      _csrf: csrfToken,
      title: "Future Todo",
      dueDate: futureDate.toISOString(),
      completed: false,
    });

    expect(response.statusCode).toBe(302);
  });

  test("create a new overdue todo item", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const response = await agent.post("/todo").send({
      _csrf: csrfToken,
      title: "Overdue Todo",
      dueDate: pastDate.toISOString(),
      completed: false,
    });

    expect(response.statusCode).toBe(302);
  });

  test("mark overdue todo item as completed", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const todoResponse = await agent.post("/todo").send({
      _csrf: csrfToken,
      title: "Overdue Todo",
      dueDate: pastDate.toISOString(),
      completed: false,
    });

    const todoId = todoResponse.body.id;

    const markCompleteResponse = await agent.put(`/todo/${todoId}/markAsCompleted`).send({
      _csrf: csrfToken,
    });

    expect(markCompleteResponse.statusCode).toBe(200);
    expect(markCompleteResponse.body.completed).toBe(true);
  });

  test("ensure each section contains one element with the given IDs", async () => {
    // Assuming you have IDs like 'count-overdue', 'count-due-today', etc.
    const res = await agent.get("/");
    const $ = cheerio.load(res.text);

    expect($("#count-overdue").length).toBe(1);
    expect($("#count-due-today").length).toBe(1);
    expect($("#count-due-later").length).toBe(1);
    expect($("#count-completed").length).toBe(1);
  });

  test("should not create a todo item with empty title", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);

    const response = await agent.post("/todo").send({
      _csrf: csrfToken,
      title: "",
      dueDate: new Date().toISOString(),
      completed: false,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Title cannot be empty");
  });

  test("should create sample due today item", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const response = await agent.post("/todo").send({
      _csrf: csrfToken,
      title: "Sample Due Today",
      dueDate: today.toISOString(),
      completed: false,
    });

    expect(response.statusCode).toBe(302);
  });

  test("should create sample due later item", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2); // Set due date 2 days later

    const response = await agent.post("/todo").send({
      _csrf: csrfToken,
      title: "Sample Due Later",
      dueDate: futureDate.toISOString(),
      completed: false,
    });

    expect(response.statusCode).toBe(302);
  });

  test("should create sample overdue item", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2); // Set due date 2 days ago

    const response = await agent.post("/todo").send({
      _csrf: csrfToken,
      title: "Sample Overdue",
      dueDate: pastDate.toISOString(),
      completed: false,
    });

    expect(response.statusCode).toBe(302);
  });

  test("should mark sample overdue item as completed", async () => {
  const res = await agent.get("/");
  const csrfToken = extractCsrfToken(res);

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 2); // Set due date 2 days ago

  const todoResponse = await agent.post("/todo").send({
    _csrf: csrfToken,
    title: "Sample Overdue",
    dueDate: pastDate.toISOString(),
    completed: false,
  });

  const todoId = todoResponse.body.id;

  const markCompleteResponse = await agent.put(`/todo/${todoId}/markAsCompleted`).send({
    _csrf: csrfToken,
  });

  expect(markCompleteResponse.statusCode).toBe(200);
  expect(markCompleteResponse.body.completed).toBe(true);
});


  test("should toggle a completed item to incomplete when clicked on it", async () => {
  const res = await agent.get("/");
  const csrfToken = extractCsrfToken(res);

  const todoResponse = await agent.post("/todo").send({
    _csrf: csrfToken,
    title: "Toggle Todo",
    dueDate: new Date().toISOString(),
    completed: true, // Create a completed item
  });

  const todoId = todoResponse.body.id;

  await agent.put(`/todo/${todoId}/toggleCompletion`).send({
    _csrf: csrfToken,
  });

  const updatedTodoResponse = await agent.get("/");
  const updatedTodo = updatedTodoResponse.body.find(todo => todo.id === todoId);

  expect(updatedTodo.completed).toBe(false);
});

    const updatedTodoResponse = await agent.get("/");
    const updatedTodo = updatedTodoResponse.body.find
