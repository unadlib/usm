import Module, { action, state } from '../../module';
import { getMainService } from '../../services/MainService';

export default class Services extends Module {
  _service = getMainService();

  async add(...args:[]) {
    // @ts-ignore
    await this._service._modules.todoList.add(...args);
  }

  async fetch() {
    // @ts-ignore
    return await this._service._modules.todoList.fetch();
  }
}
