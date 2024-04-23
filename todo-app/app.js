const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const path = require("path")

app.set("view engine", "ejs");

app.get("/", async (request, response) =>  {
  const allTodos = await Todo.getTodos();
  if(request.accepts("html")){
    response.render('index',{
      allTodos
    });
  }else{
      response.json({
        allTodos
      })
  }
  
});

app.use(express.static(path.join(__dirname,"public")));

app.get("/todo", async function (_request, response) {
  try {
    console.log("Processing list of all Todos ...");
    const todos = await Todo.findAll(); // Retrieve all Todos from the database
    response.json(todos);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.get("/todo/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    return response.json(todo);
  } catch (error) {
    console.error(error);
    return response.status(422).json({ error: "Failed to fetch todo" });
  }
});

app.post("/todo", async function (request, response) {
  try {
    const todo = await Todo.create(request.body); // Create a new Todo
    return response.json(todo);
  } catch (error) {
    console.error(error);
    return response.status(422).json({ error: "Failed to create todo" });
  }
});

app.put("/todo/:id/markAsCompleted", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    const updatedTodo = await todo.update({ completed: true });
    return response.json(updatedTodo);
  } catch (error) {
    console.error(error);
    return response.status(422).json({ error: "Failed to mark todo as completed" });
  }
});

app.delete("/todo/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    await todo.destroy(); // Delete the Todo
    return response.json({ success: true });
  } catch (error) {
    console.error(error);
    return response.status(422).json({ error: "Failed to delete todo" });
  }
});

module.exports = app;
