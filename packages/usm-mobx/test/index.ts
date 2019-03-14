import Module, { action, state, computed } from '../src';

// TODO support mobx4
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

  @computed
  length = [
    () => this.list,
    (list: []) => {
      console.log('computed => list.length');
      return list.length;
    }
  ];
}


class Index extends Module {}
const todoList = new TodoList();

const index = Index.create({
  modules: [todoList]
});

index.store.subscribe(() => {
  console.log(index.modules.todoList.state.list, todoList.count);
});