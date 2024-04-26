const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");

// Middleware
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", async (request, response) => {
  try {
    const allTodos = await Todo.getTodos();
    if (request.accepts("html")) {
      response.render('index', { allTodos });
    } else {
      response.json({ allTodos });
    }
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.get("/todo", async (request, response) => {
  try {
    const todos = await Todo.findAll();
    response.json(todos);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.get("/todo/:id", async (request, response) => {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    response.json(todo);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to fetch todo" });
  }
});

app.post("/todo", async (request, response) => {
  try {
    const todo = await Todo.create(request.body);
    response.json(todo);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to create todo" });
  }
});

app.put("/todo/:id/markAsCompleted", async (request, response) => {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    const updatedTodo = await todo.update({ completed: true });
    response.json(updatedTodo);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to mark todo as completed" });
  }
});

app.delete("/todo/:id", async (request, response) => {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    await todo.destroy();
    response.json({ success: true });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to delete todo" });
  }
});

module.exports = app;
