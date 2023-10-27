import express, { Application } from "express"
import { readFileSync } from "fs"
import { resolve } from "path"
import bodyParse from "body-parser"
import { fileOperation, readFile, writeFile } from "./utils"
import { ITodoData } from "../src/typings"
const app: Application = express()

app.use(bodyParse.urlencoded({ extended: true }))
app.use(bodyParse.json())

app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*")
    res.header('Access-Control-Allow-Methods', "POST,GET,PUT,DELETE")
    next();
})

app.get('/todolist', (req, res) => {
    const todoList = fileOperation('todo.json') as string
    console.log(todoList)
    res.send(todoList)
})
app.post('/toggle', (req, res) => {
    const id: number = parseInt(req.body.id)
    //    let todoList:ITodoData[]=JSON.parse(readFile('todo.json')||'[]')
    //    todoList=todoList.filter((todo:ITodoData)=>todo.id!==id)
    //    writeFile("todo.json",todoList)
    fileOperation("todo.json", function (todoList: ITodoData[]) {
        return todoList.map((todo: ITodoData) => {
            if (todo.id === id) {
                todo.completed = !todo.completed
            }
            return todo
        })
    })
    res.send({
        msg: "ok",
        statusCode: "200"
    })
})
app.post('/remove', (req, res) => {
    const id: number = parseInt(req.body.id)
    //    let todoList:ITodoData[]=JSON.parse(readFile('todo.json')||'[]')
    //    todoList=todoList.filter((todo:ITodoData)=>todo.id!==id)
    //    writeFile("todo.json",todoList)
    fileOperation("todo.json", function (todoList: ITodoData[]) {
        return todoList.filter((todo: ITodoData) => todo.id !== id)
    })
    res.send({
        msg: "ok",
        statusCode: "200"
    })
})

app.post('/add', (req, res) => {
    const todo: ITodoData = JSON.parse(req.body.todo);
    fileOperation("todo.json", function (todoList: ITodoData[]) {
        const isExis = todoList.find((t: ITodoData) => {
            t.content === todo.content
        })
        if (isExis) {
            res.send({
                msg: "exist",
                statusCode: "100"
            })
            return
        }
        todoList.push(todo)
        return todoList
    })
    res.send({
        msg: "ok",
        statusCode: "200"
    })
})

app.listen(3003, () => {
    console.log("ok")
})