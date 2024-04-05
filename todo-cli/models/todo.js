// models/todo.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      // Define associations here
    }

    static async markAsComplete(id) {
      try {
        const todo = await this.findByPk(id);
        if (!todo) {
          throw new Error(`Todo with id ${id} not found.`);
        }
        todo.completed = true;
        await todo.save();
        return todo;
      } catch (error) {
        throw new Error(`Error marking todo as complete: ${error.message}`);
      }
    }

    // Other model methods...
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
