'use strict';
const { Sequelize, Model, DataTypes, Op } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static async addTask(params) {
      return await Todo.create(params);
    }

   static async showList() {
  console.log('My Todo-list\n');

  console.log('Overdue');
  const overdueTodos = await Todo.overdue();
  overdueTodos.forEach(todo => console.log(`${todo.id}. [ ] ${todo.title} ${todo.dueDate}`));
  console.log('');

  console.log('Due Today');
  const dueTodayTodos = await Todo.dueToday(); // Check this line
  dueTodayTodos.forEach(todo => console.log(`${todo.id}. [x] ${todo.title} ${todo.dueDate}`));
  console.log('');

  console.log('Due Later');
  const dueLaterTodos = await Todo.dueLater();
  dueLaterTodos.forEach(todo => console.log(`${todo.id}. [ ] ${todo.title} ${todo.dueDate}`));
}
  static async dueToday() {
  return await Todo.findAll({
    where: {
      dueDate: new Date(),
      completed: false
    }
  });
}
   static async overdue() {
  return await Todo.findAll({
    where: {
      dueDate: { [Op.lt]: new Date() },
      completed: false
    }
  });
}
    static async dueLater() {
  return await Todo.findAll({
    where: {
      dueDate: { [Op.gt]: new Date() },
      completed: false
    }
  });
}
static async markAsComplete(id) {
  const todo = await Todo.findByPk(id);
  if (!todo) {
    throw new Error(`Todo with id ${id} not found`);
  }
  todo.completed = true;
  await todo.save();
  return todo;
}
    // Your other static methods

 displayableString() {
  let checkbox = this.completed ? "[x]" : "[ ]";
  let dueDateString = '';

  if (this.completed && new Date(this.dueDate) < new Date()) {
    dueDateString = ` ${this.dueDate}`; // Include due date for completed past-due items
  }

  return `${this.id}. ${checkbox} ${this.title}${dueDateString}`;
}
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: 'Todo',
    }
  );

  return Todo;
};