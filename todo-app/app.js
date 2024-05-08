const express = require("express");
const csurf = require("csurf");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const { Todo } = require("./models");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// CSRF protection
app.use(csurf({ cookie: true }));

// Custom middleware to handle CSRF token errors
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)

  // Handle CSRF token errors here
  res.status(403).json({ error: 'Invalid CSRF token' });
});

app.set("view engine", "ejs");

// Routes
app.get("/", async (request, response) => {
  try {
    const overdue = await Todo.overdue();
    const dueToday = await Todo.dueToday();
    const dueLater = await Todo.dueLater();
    const completed = await Todo.completed();

    // Render the index view with data
    response.render("index", {
      title: "Todo Application",
      overdue,
      dueToday,
      dueLater,
      completed,
      csrfToken: request.csrfToken(),
    });
  } catch (error) {
    console.error("Error:", error);
    response.status(500).send("Internal Server Error");
  }
});

app.post("/todo", async (req, res) => {
  try {
    // Check if the title is empty
    if (!req.body.title) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }

    // Check if the due date is empty
    if (!req.body.dueDate) {
      return res.status(400).json({ error: "Due date cannot be empty" });
    }

    // Create a new todo item
    await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
    });

    // Redirect to the homepage after creating the todo
    return res.redirect("/");
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/todo/:id/markAsCompleted", async (req, res) => {
  try {
    // Find the todo item by ID
    const todo = await Todo.findByPk(req.params.id);

    // Mark the todo item as completed
    const updatedTodo = await todo.markAsCompleted();

    // Send the updated todo item as JSON response
    return res.json(updatedTodo);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/todo/:id", async (req, res) => {
  try {
    // Find the todo item by ID and remove it
    await Todo.remove(req.params.id);

    // Send success message as JSON response
    return res.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = app;
