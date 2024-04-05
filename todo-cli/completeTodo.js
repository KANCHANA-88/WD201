const argv = require('minimist')(process.argv.slice(2));
const db = require("./models/index");

const markAsComplete = async (id) => {
  try {
    await db.Todo.markAsComplete(id);
  } catch (error) {
    console.error(error);
  }
};

(async () => {
  const id = parseInt(argv.id); // Parse the id as an integer
  if(isNaN(id)) { // Check if it's not a number
    throw new Error("The id needs to be an integer");
  }

  await markAsComplete(id);
  await db.Todo.showList();
})();
