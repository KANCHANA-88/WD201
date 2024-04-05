// addTodo.js

const db = require("./models/index");

const createTodo = async (title, dueDate) => {
  try {
    await db.Todo.addTask({ title, dueDate, completed: false });
    console.log("Todo added successfully.");
  } catch (error) {
    console.error("Error adding todo:", error);
  }
};

(async () => {
  const argv = require('minimist')(process.argv.slice(2));
  const { title, dueInDays } = argv;

  if (!title) {
    console.error("Please provide a title for the todo.");
    return;
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (dueInDays || 0));

  await createTodo(title, dueDate);
})();
