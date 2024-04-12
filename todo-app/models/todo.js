"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }

<<<<<<< HEAD
    markAsCompleted() {
      return this.update({ completed: true });
=======
    static getAllTodos() {
      return this.findAll({ order: [["id", "ASC"]] });
    }

    markAsCompleted() {
      return this.update({ completed: true });
    }

    delete() {
      return this.destroy();
>>>>>>> 2849b0992917c2ae88ea5da5155c24a461806fc6
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
