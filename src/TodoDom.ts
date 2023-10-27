import TodoTemplate from "./TodoTemplate";
import { ITodoData } from "./typings";
import { createItem, findParentNode } from "./utils";

class TodoDom extends TodoTemplate{
    private todoWarpper:HTMLElement;
    constructor(todoWarpper:HTMLElement){
        super()
        this.todoWarpper=todoWarpper
    }
    protected initList(todoData:ITodoData[]){
        if(todoData.length){
            const oFrag:DocumentFragment=document.createDocumentFragment()
            todoData.map((todo:ITodoData)=>{
               const oItem:HTMLElement= createItem("div","todo-item",this.todoView(todo))
                // const oItem:HTMLElement=document.createElement("div")
                // oItem.className='todo-item'
                // oItem.innerHTML=this.todoView(todo)
                 oFrag.appendChild(oItem)
            })
            this.todoWarpper.appendChild(oFrag)
        }
    }
    protected addItem(todo:ITodoData){
        const oItem:HTMLElement= createItem("div","todo-item",this.todoView(todo))
    //    const oItem:HTMLElement=document.createElement('div');
    //    oItem.className='todo-item'
    //    oItem.innerHTML=this.todoView(todo)
       this.todoWarpper.appendChild(oItem)
    }
    protected removeItem(target:HTMLElement){
        const oParentNode:HTMLElement=findParentNode(target,"todo-item");
        oParentNode.remove()
    }
    protected changeCompleted(target:HTMLElement,completed:boolean){
        const oParentNode:HTMLElement=findParentNode(target,"todo-item");
        const oContent:HTMLElement=oParentNode.getElementsByTagName("span")[0]
        oContent.style.textDecoration=completed?'line-through':"none"
    }
}


export default TodoDom