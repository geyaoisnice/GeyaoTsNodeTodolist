import $ from 'jquery'
import { ITodoData } from './typings'

export function getTodoList(
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor
): void {
    console.log(target, methodName, descriptor)
    const _origin = descriptor.value
    descriptor.value = function (todoData: ITodoData[]) {
        $.get("http://localhost:3003/todolist").then((res: string) => {
            if (!res) {
                return
            }
            todoData = JSON.parse(res)
        }).then(() => {
            _origin.call(this, todoData)
        })
    }
}

export function removeTodo(target: any,
    methodName: string,
    descriptor: PropertyDescriptor): void {
       
        const _origin = descriptor.value
        descriptor.value = function (target: HTMLElement,id:number) {
            $.post("http://localhost:3003/remove",{id}).then((res: string) => {
                _origin.call(this, target,id)
            })
        }
}

export function toggleTodo(target: any,
    methodName: string,
    descriptor: PropertyDescriptor): void {
        const _origin = descriptor.value
        descriptor.value = function (target: HTMLElement,id:number) {
            $.post("http://localhost:3003/toggle",{id}).then((res: string) => {
                _origin.call(this, target,id)
            })
        }
}

export function addTodo(target: any,
    methodName: string,
    descriptor: PropertyDescriptor): void {
        const _origin = descriptor.value
        descriptor.value = function (todo:ITodoData[]) {
            $.post("http://localhost:3003/add",{todo:JSON.stringify(todo)}).then((res: any) => {
                if(res.statusCode==="100"){
                    alert("该项已经存在")
                    return 
                }
                _origin.call(this, todo)
            })
        }
}