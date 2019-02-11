import Module from 'usm';
import TodoList from '../TodoList';

class MainService extends Module {
  async add(...args:[]) {
    return this._modules.todoList.add(...args);
  }

  async fetch() {
    return this._modules.todoList.list;
  }
}

function getMainService() {
  const todoList = new TodoList();
  const mainService = MainService.create({
    modules: [todoList]
  });
  return mainService;
}

export {
  getMainService
} 