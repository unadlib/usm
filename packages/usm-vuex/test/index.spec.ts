import Module, { state, action, computed } from '../src';
const logs = [];
const print = console.log;
console.log = (...args) => {
  logs.push(JSON.parse(JSON.stringify(args)));
}

function run() {
  return new Promise((resolve) => {
    const log = [];
    interface Todo {
      text: string,
      completed: boolean,
    }
    class TodoList extends Module<{ foo: Foo }> {  
      @state list: Todo[] = [{text: 'Learn Typescript', completed: false}];
    
      @action
      add(todo: Todo, state?: any) {
        state.list.push(todo);
      }
    
      @action
      toggle(index: number, state?: any) {
        const todo: Todo = state.list[index];
        todo.completed = !todo.completed;
      }
    
      async moduleDidInitialize() {
        console.log('moduleDidInitialize');
        this.add({text: 'Learn C++', completed: false});
        this.toggle(0);
        this.length;
        this.toggle(0);
        this.length;
        this.toggle(0);
        this.add({text: 'Learn Go', completed: false});
        resolve();
      }
      
      @computed
      length = [
        () => this.list.length,
        (length: number) => {
          console.log('computed: length => list.length');
          return length;
        }
      ];
    
      @computed
      get size() {
        console.log('computed: size => list.length');
        return this.list.length + this._modules.foo.bar;
      }
    
      get amount() {
        console.log('computed: amount => list.length');
        return this.list.length;
      }
    }
    
    class Foo extends Module {
      @state bar = 1;
    }
    class Index extends Module<{ todoList: TodoList }> {
      list() {
        this.modules.todoList.state.list;
      }
    }
    const todoList = new TodoList({
      modules: {
        foo: new Foo
      }
    });
    
    const index = Index.create({
      modules: {
        todoList,
      }
    });
    
    index.store.subscribe(() => {
      console.log(
        index.modules.todoList.state.list,
        todoList.list[0].completed,
        todoList.length,
        todoList.size,
        todoList.amount
      );
    });
  })
}

test('test with deps getters', async () => {
  await run();
  expect(logs).toEqual([
    [
      "moduleDidInitialize"
    ],
    [
      "computed: length => list.length"
    ],
    [
      "computed: size => list.length"
    ],
    [
      "computed: amount => list.length"
    ],
    [
      [
        {
          "text": "Learn Typescript",
          "completed": false
        },
        {
          "text": "Learn C++",
          "completed": false
        }
      ],
      false,
      2,
      3,
      2
    ],
    [
      "computed: amount => list.length"
    ],
    [
      [
        {
          "text": "Learn Typescript",
          "completed": true
        },
        {
          "text": "Learn C++",
          "completed": false
        }
      ],
      true,
      2,
      3,
      2
    ],
    [
      "computed: amount => list.length"
    ],
    [
      [
        {
          "text": "Learn Typescript",
          "completed": false
        },
        {
          "text": "Learn C++",
          "completed": false
        }
      ],
      false,
      2,
      3,
      2
    ],
    [
      "computed: amount => list.length"
    ],
    [
      [
        {
          "text": "Learn Typescript",
          "completed": true
        },
        {
          "text": "Learn C++",
          "completed": false
        }
      ],
      true,
      2,
      3,
      2
    ],
    [
      "computed: length => list.length"
    ],
    [
      "computed: size => list.length"
    ],
    [
      "computed: amount => list.length"
    ],
    [
      [
        {
          "text": "Learn Typescript",
          "completed": true
        },
        {
          "text": "Learn C++",
          "completed": false
        },
        {
          "text": "Learn Go",
          "completed": false
        }
      ],
      true,
      3,
      4,
      3
    ]
  ]);
})