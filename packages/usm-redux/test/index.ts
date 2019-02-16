import Module, { action, state } from '../src';

class TodoList extends Module {  
  @state list = [{todo: 'Learn Typescript'}]

  @action
  add(todo: object, state?: any) {
    state.list.push(todo);
  }

  async moduleDidInitialize() {
    console.log('moduleDidInitialize');
    this.add({todo: 'Learn C++'});
  }
}


class Index extends Module {}
const todoList = new TodoList();

const index = Index.create({
  modules: [todoList]
});

index.store.subscribe(() => {
  // @ts-ignore
  console.log(index.modules.todoList.list, todoList.ready);
});
