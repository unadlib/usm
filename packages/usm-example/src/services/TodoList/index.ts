import Module from 'usm';

interface Todo {
  item: string;
}

export default class TodoList extends Module {  
  list: Todo[] = [{item: 'Learn Typescript'}];

  add(todo: Todo) {
    this.list.push(todo);
  }

  async fetch() {
    // @ts-ignore
    return this.list;
  }
}