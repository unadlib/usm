import Module, { state, action } from '../';

class TodoList extends Module {  
  @state list = [{todo: 'Learn Typescript'}]

  @action
  add(todo: object, state?: any) {
    state.list.push(todo);
  }

  async moduleWillInitialize() {
    console.log('moduleWillInitialize', { resetting: this.resetting, ready: this.ready, pending: this.pending });
  }

  async moduleWillInitializeSuccess() {
    console.log('moduleWillInitializeSuccess', { resetting: this.resetting, ready: this.ready, pending: this.pending });
  }

  async moduleDidInitialize() {
    console.log('moduleDidInitialize', { resetting: this.resetting, ready: this.ready, pending: this.pending });
    this.add({todo: 'Learn C++'});
  }

  async moduleWillReset() {
    console.log('moduleWillReset', { resetting: this.resetting, ready: this.ready, pending: this.pending });
  }

  async moduleDidReset() {
    console.log('moduleDidReset', { resetting: this.resetting, ready: this.ready, pending: this.pending });
  }
}


class Index extends Module{}
const todoList = new TodoList();

const index = Index.create({
  modules: [todoList]
});

setTimeout(() => {
  index.resetModule();
},100);
// TODO store.subscribe
// index.store.subscribe(() => {
//   // @ts-ignore
//   console.log(index.modules.todoList.list, todoList.ready);
// });
