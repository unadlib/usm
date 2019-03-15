import Module, { state, action } from '../';

interface Todo {
  text: string,
}

function generate() {
  class TodoList extends Module {
    @state list: Todo[] = [{text: "Learn Typescript"}];
  
    @action
    add(todo: Todo, state?: any) {
      state.list.push(todo);
    }
  
    async moduleDidInitialize() {
      console.log('moduleDidInitialize');
      this.add({text: 'Learn C++'});
    }
  }
  
  class Index extends Module {}
  class Home extends Module {}
  class Other extends Module {}
  return {
    TodoList,
    Index,
    Home,
    Other
  }
}

describe('single module create', () => {
  test('check `create` function', () => {
    const { TodoList }= generate();
    const todoList = TodoList.create();
    expect(todoList.ready).toBeFalsy();
    setTimeout(() => {
      expect(todoList.ready).toBeTruthy();
    });
  });
  test('check create a instance & bootstrap', async () => {
    const { TodoList }= generate();
    const todoList = new TodoList();
    todoList.bootstrap();
    expect(todoList.ready).toBeFalsy();
    expect(todoList.state.list.length).toEqual(1);
    await new Promise(resolve => setTimeout(resolve));
    expect(todoList.ready).toBeTruthy();
    expect(todoList.state.list.length).toEqual(2);
  });
});

describe('parent-child set modules', () => {
  test('check `create` function', async () => {
    const {
      TodoList,
      Index
    }= generate();
    const todoList = new TodoList();
    const index = Index.create({
      modules: [todoList]
    });
    expect(index.ready).toBeFalsy();
    await new Promise(resolve => setTimeout(resolve));
    expect(todoList.ready).toBeTruthy();
    expect(index.ready).toBeTruthy();
  });
  test('check `create` function for deep sub-modules', async () => {
    const {
      TodoList,
      Index,
      Other,
      Home
    }= generate();
    const todoList = new TodoList();
    const index = new Index({
      modules: [todoList]
    });
    const other = new Other({
      modules: [todoList]
    });
    const home = Home.create({
      modules: [index, other]
    });
    expect(home.ready).toBeFalsy();
    expect(home.modules.todoList.state.list.length).toEqual(1);
    await new Promise(resolve => setTimeout(resolve));
    expect(home.modules.todoList.state.list.length).toEqual(2);
    expect(todoList.ready).toBeTruthy();
    expect(index.ready).toBeTruthy();
    expect(home.ready).toBeTruthy();
    expect(other.ready).toBeTruthy();
  });
});

