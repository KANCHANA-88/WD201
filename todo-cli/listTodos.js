const db = require("./models/index");

const listTodo = async () => {
  try {
    const todos = await db.Todo.findAll();
    console.log("My Todo list\n");

    console.log("Overdue");
    const overdueTodos = todos.filter(todo => !todo.completed && todo.dueDate < new Date());
    overdueTodos.forEach(todo => {
      console.log(todo.displayableString());
    });

    console.log("\nDue Today");
    const dueTodayTodos = todos.filter(todo => todo.dueDate && todo.dueDate.toISOString().split("T")[0] === new Date().toISOString().split("T")[0]);
    dueTodayTodos.forEach(todo => {
      console.log(todo.displayableString());
    });

    console.log("\nDue Later");
    const dueLaterTodos = todos.filter(todo => !todo.completed && (!todo.dueDate || todo.dueDate > new Date()));
    dueLaterTodos.forEach(todo => {
      console.log(todo.displayableString());
    });
  } catch (error) {
    console.error(error);
  }
};

(async () => {
  await listTodo();
})();