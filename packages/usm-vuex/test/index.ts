import Module, { state, action, computed } from '../src';


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
  }
  
  @computed
  length = [
    () => this.list.length,
    () => this._modules.foo.bar,
    (length: number, bar: number) => {
      console.log('computed: length => list.length');
      return length + bar;
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

  @action
  add(state) {
    state.bar++;
  }
}
class Index extends Module<{ todoList: TodoList }> {
  list() {
    this._modules.todoList.state.list;
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
debugger
index.store.subscribe(() => {
  console.log(
    index._modules.todoList.state.list,
    todoList.list[0].completed,
    todoList.length,
    todoList.size,
    todoList.amount
  );
});
