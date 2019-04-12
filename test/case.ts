export default async (Module: any, state: any, action: any, computed: any) => {
  return new Promise(resolve => {
    interface Todo {
      text: string,
      completed: boolean,
    }
    class TodoList extends Module {
      @state visibilityFilter = 'SHOW_ALL';
      @state list: Todo[];
      
      constructor(...args:[]) {
        super(...args);
        this.list = [{text: 'Learn Typescript', completed: false}];
      }

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
          console.log('computed => list.length');
          return length;
        }
      ];
    }
    
    
    class Index extends Module {}
    const todoList = new TodoList();
    
    const index = Index.create({
      modules: {
        todoList,
      }
    });
    
    index.store.subscribe(() => {
      console.log(index.modules.todoList.state.list, todoList.length);
    });
  })
}