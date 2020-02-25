export default (Module: any, state: any, action: any, computed: any) => {
  return new Promise(resolve => {
    interface Todo {
      text: string,
      completed: boolean,
    }
    let index;
    class TodoList extends Module {
      @state visibilityFilter = 'SHOW_ALL';
      @state list: Todo[];
      
      constructor(...args:[]) {
        super(...args);
        this.list = [{text: 'Learn Typescript', completed: false}];
      }

      @action
      add(todo: Todo) {
        this.state.list.push(todo);
      }
    
      @action
      toggle(index: number) {
        const todo: Todo = this.state.list[index];
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
    class BaseCounter extends Module {
      @state
      i = 0;

      @action
      increase() {
        this.state.i += 1;
      }
    }
    class Counter extends BaseCounter {
      @state
      j = 0;

      @action
      decrease() {
        this.state.j -= 1;
      }

      moduleDidInitialize() {
        this.decrease();
        this.increase();
        resolve(index);
      }
    }
    class FooBar extends Module {}
    const fooBar = new FooBar();
    const counter = new (Counter as any)({
      modules: {
        fooBar,
      }
    });
    const todoList = new TodoList();
    
    index = Index.create({
      modules: {
        todoList,
        counter,
        fooBar,
        indexOptions: { enable: true }
      }
    });
    
    index.store.subscribe(() => {
      console.log(
        index._modules.todoList.state.list,
        index._modules.indexOptions.enable,
        todoList.length,
        index._modules.counter.i,
        index._modules.counter.j,
      );
    });
  })
}