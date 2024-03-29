const todoList = require('../todo');
let todos;

  beforeEach(() => {
    todos = todoList();
  });

describe('Todo List', () => {
  

  test('should add new todo', () => {
    todos.add({ title: 'Submit assignment', dueDate: '2024-03-28', completed: false });
    expect(todos.all.length).toBe(1);
  });

  test('should mark a todo as completed', () => {
    todos.add({ title: 'Submit assignment', dueDate: '2024-03-28', completed: false });
    todos.markAsComplete(0);
    expect(todos.all[0].completed).toBe(true);
  });

  test('should retrieve overdue items', () => {
    const today = '2024-03-29';
    todos.add({ title: 'Submit assignment', dueDate: '2024-03-28', completed: false });
    todos.add({ title: 'Pay rent', dueDate: today, completed: false });
    const overdueItems = todos.overdue();
    expect(overdueItems.length).toBe(1);
  });

  test('should retrieve due today items', () => {
    const today = '2024-03-29';
    todos.add({ title: 'Submit assignment', dueDate: '2024-03-28', completed: false });
    todos.add({ title: 'Pay rent', dueDate: today, completed: false });
    const dueTodayItems = todos.dueToday();
    expect(dueTodayItems.length).toBe(1);
  });

  test('should retrieve due later items', () => {
    const today = '2024-03-29';
    todos.add({ title: 'Submit assignment', dueDate: '2024-03-30', completed: false });
    todos.add({ title: 'Pay rent', dueDate: today, completed: false });
    const dueLaterItems = todos.dueLater();
    expect(dueLaterItems.length).toBe(1);
  });
});
