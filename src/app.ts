import { ITodoData } from "./typings";
import TodoEvent from "./TodoEvent";
; ((doc) => {
    const oInput: HTMLInputElement = document.querySelector('input') as HTMLInputElement
    const oAddBtn: HTMLElement = document.querySelector('button') as HTMLElement
    const oTodoList: HTMLElement = document.querySelector('.todo-list') as HTMLElement

    const todoData: ITodoData[] = [
        {
            id: 1,
            content: 'geyao',
            completed: false
        },
        {
            id: 2,
            content: 'fangfang',
            completed: false
        },
        {
            id: 3,
            content: 'kang',
            completed: false
        }
    ]

    const init = (): void => {
        bindEvent()
    }

    function bindEvent(): void {
        oAddBtn.addEventListener("click", handleAddBtnClick, false)
        oTodoList.addEventListener("click", handleListClick, false)
    }
    function handleAddBtnClick(): void {
        const val:string=oInput.value.trim()
        console.log(val,"val is")
        if(val.length){
           const ret= todoEvent.addTodo(<ITodoData>{
                id: 4,
                content: val,
                completed: false
            })
            if(ret&&ret===1001){
                alert("列表已经存在")
                return
            }
            oInput.value=''
        }
       
   
    }
    function handleListClick(e: MouseEvent): void {
        const tar = e.target as HTMLElement
        const tagName = tar.tagName.toLowerCase()
        if (tagName === 'input' || tagName === 'button') {
            const id=parseInt(tar.dataset.id as string)
            switch (tagName) {
                case 'input':
                    todoEvent.toggleComplete(tar,id)
                    break;
                case 'button':
                    todoEvent.removeTodo(tar,id)
                    break;
                default:
                    break;
            }
        }
    }
    const todoEvent: TodoEvent = new TodoEvent(todoData,oTodoList)
    init()

})(document)