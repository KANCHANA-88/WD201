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
  if (request.user) {
    return response.redirect("/todo");
  }
  return response.render("index", {
    title: "Todo Application",
    csrfToken: request.csrfToken(),
  });
});

app.get(
  "/todo",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    // const allTodos = await db.Todos.getTodos();
    const completed = await db.Todos.completed(request.user.id);
    const overdue = await db.Todos.overdue(request.user.id);
    const dueToday = await db.Todos.dueToday(request.user.id);
    const dueLater = await db.Todos.dueLater(request.user.id);
    if (request.accepts("html")) {
      return response.render("todo", {
        title: "Todo Application",
        username: request.user.firstname,
        completed,
        overdue,
        dueToday,
        dueLater,
        csrfToken: request.csrfToken(),
      });
    } else {
      return response.json({ completed, overdue, dueToday, dueLater });
    }
  }
);

app.post(
  "/todo",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    if (!request.body.title || !request.body.dueDate) {
      ["title", "dueDate"].map((param) => {
        !request.body[param]
          ? request.flash("error", `${param} cannot be empty`)
          : null;
        console.log(request.body[param]);
      });

      return response.redirect("/todo");
    }
    try {
      await db.Todos.addTodo({
        title: request.body.title,
        dueDate: request.body.dueDate,
        userId: request.user.id,
      });
      return response.redirect("/todo");
    } catch (error) {
      if (
        error instanceof sequelize.ValidationError &&
        error.errors[0].validatorKey === "len"
      ) {
        console.log(error.errors[0].validatorKey);
        request.flash("error", `Minimum Title Length should be 5 characters!`);
        return response.redirect("/todo");
      }
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.put(
  "/todo/:id",
  async (request, response) => {
    console.log("Updating Todo with ID: ", request.params.id);
    const todo = await db.Todos.findByPk(request.params.id);

    try {
      const updatedTodo = await todo.setCompletionStatus(
        request.body.completed,
        request.user.id
      );
      if (request.accepts("html")) return response.json(updatedTodo);
      else return response.redirect("/");
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.delete(
  "/todo/:id",
  
  async (request, response) => {
    console.log("Deleting todo with ID: ", request.params.id);
    try {
      const todo = await db.Todos.findByPk(request.params.id);
      if (todo) {
        await db.Todos.remove(request.params.id, request.user.id);
        return response.json(true);
      } else {
        return response.json(false);
      }
    } catch (error) {
      console.log(error);
      return response.status(422).json(false);
    }
  }
);

module.exports = app;