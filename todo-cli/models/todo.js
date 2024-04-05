'use strict';
const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static async addTask(params) {
      return await Todo.create(params);
    }

    static async showList() {
      console.log('My Todo list \n');

      console.log('Overdue');
      const overdueTasks = await Todo.overdue();
      overdueTasks.forEach(task => console.log(task.displayableString()));
      console.log('\n');

      console.log('Due Today');
      const todayTasks = await Todo.dueToday();
      todayTasks.forEach(task => console.log(task.displayableString()));
      console.log('\n');

      console.log('Due Later');
      const laterTasks = await Todo.dueLater();
      laterTasks.forEach(task => console.log(task.displayableString()));
    }

    static async overdue() {
      return await Todo.findAll({
        where: {
          dueDate: { [Op.lt]: new Date() },
          completed: false
        }
      });
    }

    static async dueToday() {
      return await Todo.findAll({
        where: {
          dueDate: new Date(),
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
      if (todo) {
        todo.completed = true;
        await todo.save();
      }
    }

    displayableString() {
      let checkbox = this.completed ? '[x]' : '[ ]';
      return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
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
      modelName: 'Todo',
    },
  );

  return Todo;
};
