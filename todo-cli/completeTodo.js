// completeTodo.js

const db = require("./models/index");

const markAsComplete = async (id) => {
  try {
    await db.Todo.markAsComplete(id);
    console.log("Todo marked as complete successfully.");
  } catch (error) {
    console.error("Error marking todo as complete:", error);
  }
};

(async () => {
  const argv = require('minimist')(process.argv.slice(2));
  const { id } = argv;

  if (!id || isNaN(id)) {
    console.error("Please provide a valid todo ID.");
    return;
  }

  await markAsComplete(id);
})();
