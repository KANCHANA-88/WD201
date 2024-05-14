const request = require("supertest");
const db = require("../models/index");
const cheerio = require("cheerio");

const app = require("../app");
let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Todo Test Suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });
  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });



  test("Creating a new todo ", async () => {
    const res = await agent.get("/todo");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todo").send({
      title: "Buy Milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Updating a todo: Marking a todo as complete and then marking it incomplete", async () => {
    let res = await agent.get("/todo");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todo").send({
      title: "Listen to music",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/todo")
      .set("Accept", "application/json");
    const parsedTodosResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedTodosResponse.dueToday.length;
    const latestDueTodayTodo = parsedTodosResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/todo");
    csrfToken = extractCsrfToken(res);

    const markCompletedResponse = await agent
      .put(`/todo/${latestDueTodayTodo.id}`)
      .send({ _csrf: csrfToken, completed: true });
    const parsedUpdatedResponse = JSON.parse(markCompletedResponse.text);
    expect(parsedUpdatedResponse.completed).toBe(true);

    // Again marking as incomplete
    res = await agent.get("/todo");

    csrfToken = extractCsrfToken(res);
    const markIncompleteResponse = await agent
      .put(`/todo/${parsedUpdatedResponse.id}`)
      .send({
        _csrf: csrfToken,
        completed: false,
      });

    const parsedIncompleteResponse = JSON.parse(markIncompleteResponse.text);
    expect(parsedIncompleteResponse.completed).toBe(false);
  });

  test("Deleting a Todo", async () => {
    let res = await agent.get("/todo");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todo").send({
      title: "Go Green",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/todo")
      .set("Accept", "application/json");
    const parsedTodosResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedTodosResponse.dueToday.length;
    const latestDueTodayTodo = parsedTodosResponse.dueToday[dueTodayCount - 1];
    res = await agent.get("/todo");
    csrfToken = extractCsrfToken(res);

    const deletedResponse = await agent
      .delete(`/todo/${latestDueTodayTodo.id}`)
      .send({ _csrf: csrfToken });
    const parsedDeleteReponse = JSON.parse(deletedResponse.text);

    expect(parsedDeleteReponse).toBe(true);
  });
});
