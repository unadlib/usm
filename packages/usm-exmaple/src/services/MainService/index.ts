import Module from 'usm';
import TodoList from '../TodoList';

class MainService extends Module {}

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