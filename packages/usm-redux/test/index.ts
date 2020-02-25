import Module, { state, action, computed } from '../src';

interface Todo {
  text: string,
  completed: boolean,
}
class TodoList extends Module {  
  @state list: Todo[] = [{text: 'Learn Typescript', completed: false}];

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


class Index extends Module<{ todoList: TodoList }> {
  list() {
    this._modules.todoList.state.list;
  }
}
const todoList = new TodoList();

const index = Index.create({
  modules: {
    todoList,
  }
});

index.store.subscribe(() => {
  console.log(index._modules.todoList.state.list, todoList.length);
});