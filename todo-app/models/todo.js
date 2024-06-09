"use strict";
const { Model, Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      // define association here
    }

    static addTodo({ title, dueDate }) {
      if (!dueDate) {
        throw new Error('Due date is required.');
      }

      return this.create({ title, dueDate, completed: false });
    }

    static async setCompletionStatus(id, completed) {
      const todo = await this.findByPk(id);
      if (!todo) {
        throw new Error('Todo not found');
      }
      return todo.update({ completed });
    }

    static async remove(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }
  }

  Todo.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.DATE,
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );

  return Todo;
};
