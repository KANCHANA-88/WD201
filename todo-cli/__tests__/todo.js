const todoList = require('../todo');


const {all,markAsComplete,add} = todoList();

describe("Todolist Test Suite", () => {

    test("should add new todo", ()=> {
        expect(all.length).toBe(0);
        add({
            title: "Test todo",
            completed: false,
            dueDate: new Date().toLocaleDateString("en-CA")

        }
        );
        expect(all.length).toBe(1);
    });

    test("should mark a todo as complete", () => {
        expect(all[0].completed).toBe(false);
        markAsComplete(0);
        expect(all[0].completed).toBe(true);
    })
})