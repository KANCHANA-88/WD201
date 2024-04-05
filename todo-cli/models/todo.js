// models/todo.js
'use strict';
const {
  Model,
  DataTypes,
  Op 
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      // Define associations here if needed
    }

    static async addTask(params) {
      return await Todo.create(params);
    }

    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      const overdueItems = await Todo.overdue();
      console.log(Todo.toDisplayableList(overdueItems));
      console.log("\n");

      console.log("Due Today");
      const dueTodayItems = await Todo.dueToday();
      console.log(Todo.toDisplayableList(dueTodayItems));
      console.log("\n");

      console.log("Due Later");
      const dueLaterItems = await Todo.dueLater();
      console.log(Todo.toDisplayableList(dueLaterItems));
    }

    static async overdue() {
      return await Todo.findAll({
        where: {
          dueDate: { [Op.lt]: new Date() },
        },
      });
    }

    static async dueToday() {
      return await Todo.findAll({
        where: {
          dueDate: new Date(),
        },
      });
    }

    static async dueLater() {
      return await Todo.findAll({
        where: {
          dueDate: { [Op.gt]: new Date() },
        },
      });
    }

    static async markAsComplete(id) {
      const todo = await Todo.findByPk(id);
      if (!todo) {
        throw new Error('Todo not found');
      }
      todo.completed = true;
      await todo.save();
    }

    static toDisplayableList(todos) {
      let displayableList = '';
      todos.forEach(todo => {
        let status = todo.completed ? '[x]' : '[ ]';
        displayableList += `${todo.id}. ${status} ${todo.title} ${todo.dueDate}\n`;
      });
      return displayableList.trim();
    }
  }
  
  Todo.init({
    title: DataTypes.STRING,
    dueDate: DataTypes.DATEONLY,
    completed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Todo',
  });

  return Todo;
};
