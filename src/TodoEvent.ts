import TodoDom from "./TodoDom";
import { addTodo, getTodoList,removeTodo, toggleTodo } from "./Todoserver";
import { ITodoData } from "./typings";

 class TodoEvent extends TodoDom{
    private todoData: ITodoData[]

    constructor(todoData: ITodoData[],todoWarpper:HTMLElement) {
        super(todoWarpper)
        this.todoData = todoData
        this.init(this.todoData)
    }
    @addTodo
    public addTodo(todo: ITodoData): undefined | number {
        const _todo: null | ITodoData | undefined = this.todoData.find((item: ITodoData) => item.content===todo.content)
        console.log(_todo,"_todo is")
        if (!_todo) {
            this.todoData.push(todo)
            this.addItem(todo)
            return
        }
        return 1001
    }
    @getTodoList
    protected init(todoData:ITodoData[]){
        this.todoData=todoData
        this.initList(this.todoData)
    }
    @removeTodo
    public removeTodo(target:HTMLElement,id:number):void {
        this.todoData=this.todoData.filter((todo:ITodoData)=>todo.id!==id)
        this.removeItem(target)
    }
    @toggleTodo
    public toggleComplete(target:HTMLElement,id:number):void {
        this.todoData=this.todoData.map((todo:ITodoData)=>{
            if(todo.id===id){
                todo.completed=!todo.completed
                this.changeCompleted(target,todo.completed)
            }
            return todo;
        })
    }
}

export default TodoEvent