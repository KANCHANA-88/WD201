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

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to start of the day

    const response = await agent.post("/todo").send({
      _csrf: csrfToken,
      title: "Buy milk",
      dueDate: today.toISOString(),
      completed: false,
    });

    expect(response.statusCode).toBe(302);
  });

  test("create a new todo with a future due date", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // Set due date to tomorrow

    const response = await agent.post("/todo").send({
      _csrf: csrfToken,
      title: "Complete project",
      dueDate: futureDate.toISOString(),
      completed: false,
    });

    expect(response.statusCode).toBe(302);
  });

  test("create a new overdue todo item", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Set due date to yesterday

    const response = await agent.post("/todo").send({
      _csrf: csrfToken,
      title: "Submit report",
      dueDate: pastDate.toISOString(),
      completed: false,
    });

    expect(response.statusCode).toBe(302);
  });

  test("mark overdue todo item as completed", async () => {
    // Create an overdue todo item
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Set due date to yesterday

    const todoResponse = await agent.post("/todo").send({
      _csrf: csrfToken,
      title: "Submit report",
      dueDate: pastDate.toISOString(),
      completed: false,
    });

    // Mark the overdue todo item as completed
    const todoId = todoResponse.body.id;
    const markCompleteResponse = await agent.put(`/todo/${todoId}/markAsCompleted`).send({
      _csrf: csrfToken,
    });

    expect(markCompleteResponse.statusCode).toBe(200);
    expect(markCompleteResponse.body.completed).toBe(true);
  });

  // Add tests for toggling completion status and deleting a todo item here

});
test("toggle completion status of a todo item", async () => {
  // Create a new todo item
  const res = await agent.get("/");
  const csrfToken = extractCsrfToken(res);

  const todoResponse = await agent.post("/todo").send({
    _csrf: csrfToken,
    title: "Read a book",
    dueDate: new Date().toISOString(),
    completed: false,
  });

  // Get the ID of the created todo item
  const todoId = todoResponse.body.id;

  // Toggle completion status of the todo item
  await agent.put(`/todo/${todoId}/toggleCompletion`).send({
    _csrf: csrfToken,
  });

  // Retrieve the updated todo item
  const updatedTodo = await db.Todo.findByPk(todoId);

  // Ensure that the completion status is toggled
  expect(updatedTodo.completed).toBe(true);
});

test("delete a todo item", async () => {
  // Create a new todo item
  const res = await agent.get("/");
  const csrfToken = extractCsrfToken(res);

  const todoResponse = await agent.post("/todo").send({
    _csrf: csrfToken,
    title: "Go for a run",
    dueDate: new Date().toISOString(),
    completed: false,
  });

  // Get the ID of the created todo item
  const todoId = todoResponse.body.id;

  // Delete the todo item
  const deleteResponse = await agent.delete(`/todo/${todoId}`).send({
    _csrf: csrfToken,
  });

  // Ensure that the todo item is deleted
  expect(deleteResponse.statusCode).toBe(200);

  // Check if the todo item exists in the database
  const todoExists = await db.Todo.findByPk(todoId);
  expect(todoExists).toBeNull();
});