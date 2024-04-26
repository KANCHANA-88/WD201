const request = require("supertest");
const db = require("../models/index");
const app = require("../app");

let server, agent;

describe("Todo Application", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
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

  test("Creates a todo and responds with json at /todo POST endpoint", async () => {
    const response = await agent.post("/todo").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(response.statusCode).toBe(200);
    expect(response.header["content-type"]).toBe("application/json; charset=utf-8");
    const parsedResponse = JSON.parse(response.text);
    expect(parsedResponse.id).toBeDefined();
  });

  test("Marks a todo with the given ID as complete", async () => {
    const createResponse = await agent.post("/todo").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const todoID = createResponse.body.id;

    const markCompleteResponse = await agent.put(`/todo/${todoID}/markAsCompleted`).send();
    expect(markCompleteResponse.body.completed).toBe(true);
  });

  test("Fetches all todos in the database using /todo endpoint", async () => {
    await agent.post("/todo").send({ title: "Buy xbox", dueDate: new Date().toISOString(), completed: false });
    await agent.post("/todo").send({ title: "Buy ps3", dueDate: new Date().toISOString(), completed: false });
    
    const response = await agent.get("/todo");
    const parsedResponse = JSON.parse(response.text);

    // Instead of assuming one initial todo, count the todos dynamically
    expect(parsedResponse.length).toBe(2); // Since we added 2 todos above
    expect(parsedResponse[1].title).toBe("Buy ps3");
  });

 test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
  const createResponse = await agent.post("/todo").send({
    title: "Buy tesla",
    dueDate: new Date().toISOString(),
    completed: false,
  });
  const todoID = createResponse.body.id;

  const deleteTodoResponse = await agent.delete(`/todo/${todoID}`).send();
  expect(deleteTodoResponse.body.success).toBe(true);

  const deleteNonExistentTodoResponse = await agent.delete(`/todo/9999`).send();
  // Expecting a 404 status code for attempting to delete a non-existent todo
  expect(deleteNonExistentTodoResponse.status).toBe(404);
});
});
