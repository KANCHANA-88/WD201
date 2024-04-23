"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static async overdue(userId) {
      const overdueTodos = await Todos.findAll({
        where: {
          dueDate: { [Op.lt]: new Date() },
          userId,
          completed: false,
        },
      });

      return overdueTodos;
    }

    static async dueToday(userId) {
      const dueTodayTodos = await Todos.findAll({
        where: {
          dueDate: { [Op.eq]: new Date() },
          userId,
          completed: false,
        },
      });

      return dueTodayTodos;
    }

    static async dueLater(userId) {
      const dueLaterTodos = await Todos.findAll({
        where: {
          dueDate: { [Op.gt]: new Date() },
          userId,
          completed: false,
        },
      });

      return dueLaterTodos;
    }
    static async completed(userId) {
      const completedTodos = await Todos.findAll({
        where: {
          completed: true,
          userId,
        },
      });

      return completedTodos;
    }

    static async getTodos() {
      return this.findAll();
    }
    static async addTodo({ title, dueDate, userId }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userId,
      });
    }
    static async remove(id, userId) {
      return this.destroy({
        where: {
          id: id,
          userId,
        },
      });
    }
    markAsCompleted() {
      return this.update({ completed: true });
    }
    setCompletionStatus(bool, userId) {
      return this.update({ completed: bool, userId });
    }
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // define association here
      Todos.belongsTo(models.TodoUser, {
        foreignKey: "userId",
      });
    }
  }
  Todos.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          len: 5,
        },
      },
      dueDate: DataTypes.DATEONLY,
      completed: { type: DataTypes.BOOLEAN, allowNull: false },
    },
    {
      sequelize,
      modelName: "Todos",
    }
  );
  return Todos;
};
