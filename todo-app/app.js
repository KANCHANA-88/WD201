const express = require('express')
const { request } = require('http')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json());

const{ Todo } = require("./models")

app.get("/todos",(request,response) => {
   // response.send("hello world")
   console.log("Todo list")
})
app.post("/todos", async (request,response) => {
    console.log("creating a todo", request.body)
    try{
    const todo = await Todo.addTodo({ title: request.body.title, dueDate: request.body.dueDate})
    return response.json(todo)
    }catch(error){
        console.log(error)
        return response.status(422).json(error)
    }
})

app.put("/todos/:id/markAsCompleted", async (request,response) =>{
    console.log("we have  to  upddatte a todo with ID:",request.params.id)
   const todo = await Todo.findByPk(request.params.id)
   try{
   const updatedTodo = await todo.markAsCompleted()
   return response.json(updatedTodo)
   }catch(error){
    console.log(error)
    return response.status(422).json(error)

   }
})

app.delete("/todos/:id", (request,response) => {
    console.log("Delete a todo by ID:", request.params.id)
})

module.exports = app;