const request = require("supertest");
var cheerio = require("cheerio");

const db = require("../models/index");
const app = require("../app");

let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
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

  test("create a new todo", async () => {
  agent = request.agent(server);
  const res = await agent.get("/");
  const csrfToken = extractCsrfToken(res);
  const response = await agent.post("/todo").send({
    _csrf: csrfToken,
    title: "Buy milk",
    dueDate: new Date().toISOString(),
    completed: false,
  });
  expect(response.statusCode).toBe(302);
});

  test("Mark a todo as complete", async () => {
  agent = request.agent(server);
  let res = await agent.get("/");
  let csrfToken = extractCsrfToken(res);
  await agent.post("/todo").send({
    _csrf: csrfToken,
    title: "Buy milk",
    dueDate: new Date().toISOString(),
    completed: false,
  });
  const groupedTodosResponse = await agent
    .get("/")
    .set("Accept", "application/json");
  const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);

  expect(parsedGroupedResponse.dueToday).toBeDefined();

  const dueTodayCount = parsedGroupedResponse.dueToday.length;
  const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

  res = await agent.get("/");
  csrfToken = extractCsrfToken(res);

  const markCompleteResponse = await agent.put(`/todo/${latestTodo.id}/markAsCompleted`).send({
    _csrf: csrfToken,
  });
  const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
  expect(parsedUpdateResponse.completed).toBe(true);
});
});
