#  前言

> 我是歌谣 最好的种树是十年前 其次是现在 今天继续给大家带来的是原始typescript的讲解

# 环境配置
```
npm init -y
yarn add vite -D
```

# 修改page.json配置端口

```
{
  "name": "react_ts",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "vite --port 3002",
    "server":"ts-node-dev ./server/app.ts"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/jquery": "^3.5.18",
    "express": "^4.18.2",
    "jquery": "^3.7.1",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.2.2",
    "vite": "^4.4.9"
  }
}

```
#  后端部分
app.ts

```
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
```
# todo.json

```
[{"id":4,"content":"歌谣","completed":false}]
```
# untils.ts

```
import {readFileSync,writeFileSync} from "fs"
import {resolve} from "path" 
import { ITodoData } from "../src/typings"
export function readFile(path:string):string{
    return readFileSync(resolve(__dirname,path),"utf8")
}
export function writeFile<T>(path:string,data:T):void{
    writeFileSync(resolve(__dirname,path),JSON.stringify(data))
}

export function fileOperation(path:string,fn?:any):string|void{
    let todoList:ITodoData[]=JSON.parse(readFile('todo.json')||'[]')
    if(!fn){
        return JSON.stringify(todoList)
    }
    todoList=fn(todoList)
    writeFile<ITodoData[]>(path,todoList)
}

export function remove(path:string,fn?:any):string|void{
    let todoList:ITodoData[]=JSON.parse(readFile('todo.json')||'[]')
    if(!fn){
        return JSON.stringify(todoList)
    }
    todoList=fn(todoList)
    writeFile<ITodoData[]>(path,todoList)
}


```
# todoserver.ts

```
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
```

# 前端
# app.ts

```
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
```
# todoDom.ts

```
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
```
# todoTemplate.ts

```
import { ITodoData } from "./typings";

class TodoTemplate{
   protected todoView({id,content,completed}:ITodoData):string{
      return `
      <input type="checkbox" ${completed}?'checked':'' data-id="${id}"/>
      <span style="text-decoration":${completed}?'line-through':'none'>${content}</span>
      <button data-id='${id}'>删除</button>
      `
   }
}

export default TodoTemplate
```

# untils.ts

```
import { callbackify } from "util"

export function findParentNode(target:HTMLElement,className:string):any{
    while(target=target.parentNode as HTMLElement){
        if(target.className===className){
            return target 
        }
    }
}

export function createItem(tagName:string,className:string,todoItem:string):HTMLElement{
    const oItem:HTMLElement=document.createElement(tagName)
    oItem.className=className
    oItem.innerHTML=todoItem
    return oItem
}
```
# index.html

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ts</title>
</head>
<body>
    <div class="app">
        <div class="todo-input">
            <input type="text" placeholder="请输入代办事项">
            <button>增加</button>
        </div>
        <div class="todo-list"></div>
    </div>
     <script type="module" src="./src/app.ts"></script> 
</body>
</html>
```

# tsconfig.json

```
{
  "compilerOptions": {
    /* Visit https://aka.ms/tsconfig to read more about this file */

    /* Projects */
    // "incremental": true,                              /* Save .tsbuildinfo files to allow for incremental compilation of projects. */
    // "composite": true,                                /* Enable constraints that allow a TypeScript project to be used with project references. */
    // "tsBuildInfoFile": "./.tsbuildinfo",              /* Specify the path to .tsbuildinfo incremental compilation file. */
    // "disableSourceOfProjectReferenceRedirect": true,  /* Disable preferring source files instead of declaration files when referencing composite projects. */
    // "disableSolutionSearching": true,                 /* Opt a project out of multi-project reference checking when editing. */
    // "disableReferencedProjectLoad": true,             /* Reduce the number of projects loaded automatically by TypeScript. */

    /* Language and Environment */
    "target": "es2016",                                  /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    // "lib": [],                                        /* Specify a set of bundled library declaration files that describe the target runtime environment. */
    // "jsx": "preserve",                                /* Specify what JSX code is generated. */
     "experimentalDecorators": true,                   /* Enable experimental support for legacy experimental decorators. */
     "emitDecoratorMetadata": true,                    /* Emit design-type metadata for decorated declarations in source files. */
    // "jsxFactory": "",                                 /* Specify the JSX factory function used when targeting React JSX emit, e.g. 'React.createElement' or 'h'. */
    // "jsxFragmentFactory": "",                         /* Specify the JSX Fragment reference used for fragments when targeting React JSX emit e.g. 'React.Fragment' or 'Fragment'. */
    // "jsxImportSource": "",                            /* Specify module specifier used to import the JSX factory functions when using 'jsx: react-jsx*'. */
    // "reactNamespace": "",                             /* Specify the object invoked for 'createElement'. This only applies when targeting 'react' JSX emit. */
    // "noLib": true,                                    /* Disable including any library files, including the default lib.d.ts. */
    // "useDefineForClassFields": true,                  /* Emit ECMAScript-standard-compliant class fields. */
    // "moduleDetection": "auto",                        /* Control what method is used to detect module-format JS files. */

    /* Modules */
    "module": "commonjs",                                /* Specify what module code is generated. */
    // "rootDir": "./",                                  /* Specify the root folder within your source files. */
    // "moduleResolution": "node10",                     /* Specify how TypeScript looks up a file from a given module specifier. */
    // "baseUrl": "./",                                  /* Specify the base directory to resolve non-relative module names. */
    // "paths": {},                                      /* Specify a set of entries that re-map imports to additional lookup locations. */
    // "rootDirs": [],                                   /* Allow multiple folders to be treated as one when resolving modules. */
    // "typeRoots": [],                                  /* Specify multiple folders that act like './node_modules/@types'. */
    // "types": [],                                      /* Specify type package names to be included without being referenced in a source file. */
    // "allowUmdGlobalAccess": true,                     /* Allow accessing UMD globals from modules. */
    // "moduleSuffixes": [],                             /* List of file name suffixes to search when resolving a module. */
    // "allowImportingTsExtensions": true,               /* Allow imports to include TypeScript file extensions. Requires '--moduleResolution bundler' and either '--noEmit' or '--emitDeclarationOnly' to be set. */
    // "resolvePackageJsonExports": true,                /* Use the package.json 'exports' field when resolving package imports. */
    // "resolvePackageJsonImports": true,                /* Use the package.json 'imports' field when resolving imports. */
    // "customConditions": [],                           /* Conditions to set in addition to the resolver-specific defaults when resolving imports. */
    // "resolveJsonModule": true,                        /* Enable importing .json files. */
    // "allowArbitraryExtensions": true,                 /* Enable importing files with any extension, provided a declaration file is present. */
    // "noResolve": true,                                /* Disallow 'import's, 'require's or '<reference>'s from expanding the number of files TypeScript should add to a project. */

    /* JavaScript Support */
    // "allowJs": true,                                  /* Allow JavaScript files to be a part of your program. Use the 'checkJS' option to get errors from these files. */
    // "checkJs": true,                                  /* Enable error reporting in type-checked JavaScript files. */
    // "maxNodeModuleJsDepth": 1,                        /* Specify the maximum folder depth used for checking JavaScript files from 'node_modules'. Only applicable with 'allowJs'. */

    /* Emit */
    // "declaration": true,                              /* Generate .d.ts files from TypeScript and JavaScript files in your project. */
    // "declarationMap": true,                           /* Create sourcemaps for d.ts files. */
    // "emitDeclarationOnly": true,                      /* Only output d.ts files and not JavaScript files. */
    // "sourceMap": true,                                /* Create source map files for emitted JavaScript files. */
    // "inlineSourceMap": true,                          /* Include sourcemap files inside the emitted JavaScript. */
    // "outFile": "./",                                  /* Specify a file that bundles all outputs into one JavaScript file. If 'declaration' is true, also designates a file that bundles all .d.ts output. */
    // "outDir": "./",                                   /* Specify an output folder for all emitted files. */
    // "removeComments": true,                           /* Disable emitting comments. */
    // "noEmit": true,                                   /* Disable emitting files from a compilation. */
    // "importHelpers": true,                            /* Allow importing helper functions from tslib once per project, instead of including them per-file. */
    // "importsNotUsedAsValues": "remove",               /* Specify emit/checking behavior for imports that are only used for types. */
    // "downlevelIteration": true,                       /* Emit more compliant, but verbose and less performant JavaScript for iteration. */
    // "sourceRoot": "",                                 /* Specify the root path for debuggers to find the reference source code. */
    // "mapRoot": "",                                    /* Specify the location where debugger should locate map files instead of generated locations. */
    // "inlineSources": true,                            /* Include source code in the sourcemaps inside the emitted JavaScript. */
    // "emitBOM": true,                                  /* Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files. */
    // "newLine": "crlf",                                /* Set the newline character for emitting files. */
    // "stripInternal": true,                            /* Disable emitting declarations that have '@internal' in their JSDoc comments. */
    // "noEmitHelpers": true,                            /* Disable generating custom helper functions like '__extends' in compiled output. */
    // "noEmitOnError": true,                            /* Disable emitting files if any type checking errors are reported. */
    // "preserveConstEnums": true,                       /* Disable erasing 'const enum' declarations in generated code. */
    // "declarationDir": "./",                           /* Specify the output directory for generated declaration files. */
    // "preserveValueImports": true,                     /* Preserve unused imported values in the JavaScript output that would otherwise be removed. */

    /* Interop Constraints */
    // "isolatedModules": true,                          /* Ensure that each file can be safely transpiled without relying on other imports. */
    // "verbatimModuleSyntax": true,                     /* Do not transform or elide any imports or exports not marked as type-only, ensuring they are written in the output file's format based on the 'module' setting. */
    // "allowSyntheticDefaultImports": true,             /* Allow 'import x from y' when a module doesn't have a default export. */
    "esModuleInterop": true,                             /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables 'allowSyntheticDefaultImports' for type compatibility. */
    // "preserveSymlinks": true,                         /* Disable resolving symlinks to their realpath. This correlates to the same flag in node. */
    "forceConsistentCasingInFileNames": true,            /* Ensure that casing is correct in imports. */

    /* Type Checking */
    "strict": true,                                      /* Enable all strict type-checking options. */
    // "noImplicitAny": true,                            /* Enable error reporting for expressions and declarations with an implied 'any' type. */
     "strictNullChecks": false,                         /* When type checking, take into account 'null' and 'undefined'. */
    // "strictFunctionTypes": true,                      /* When assigning functions, check to ensure parameters and the return values are subtype-compatible. */
    // "strictBindCallApply": true,                      /* Check that the arguments for 'bind', 'call', and 'apply' methods match the original function. */
    // "strictPropertyInitialization": true,             /* Check for class properties that are declared but not set in the constructor. */
    // "noImplicitThis": true,                           /* Enable error reporting when 'this' is given the type 'any'. */
    // "useUnknownInCatchVariables": true,               /* Default catch clause variables as 'unknown' instead of 'any'. */
    // "alwaysStrict": true,                             /* Ensure 'use strict' is always emitted. */
    // "noUnusedLocals": true,                           /* Enable error reporting when local variables aren't read. */
    // "noUnusedParameters": true,                       /* Raise an error when a function parameter isn't read. */
    // "exactOptionalPropertyTypes": true,               /* Interpret optional property types as written, rather than adding 'undefined'. */
    // "noImplicitReturns": true,                        /* Enable error reporting for codepaths that do not explicitly return in a function. */
    // "noFallthroughCasesInSwitch": true,               /* Enable error reporting for fallthrough cases in switch statements. */
    // "noUncheckedIndexedAccess": true,                 /* Add 'undefined' to a type when accessed using an index. */
    // "noImplicitOverride": true,                       /* Ensure overriding members in derived classes are marked with an override modifier. */
    // "noPropertyAccessFromIndexSignature": true,       /* Enforces using indexed accessors for keys declared using an indexed type. */
    // "allowUnusedLabels": true,                        /* Disable error reporting for unused labels. */
    // "allowUnreachableCode": true,                     /* Disable error reporting for unreachable code. */

    /* Completeness */
    // "skipDefaultLibCheck": true,                      /* Skip type checking .d.ts files that are included with TypeScript. */
    "skipLibCheck": true                                 /* Skip type checking all .d.ts files. */
  }
}

```

# 运行结果
# 后台启动

> npm run server

![在这里插入图片描述](https://img-blog.csdnimg.cn/aea882b88f1646b681aa7b52653c0110.png)

# 前端
![在这里插入图片描述](https://img-blog.csdnimg.cn/5ea5e84def3a4db590baf10971ce710f.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/a8d18d0af0e745239756475e019ed003.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/adeab68cc3b6468eb616c48dcbd51c9e.png)
