import Module, { action, state } from '../../module';

interface Todo {
  item: string;
}

export default class ViewList extends Module {  
  @state list: Todo[] = [];

  @action
  add(list: Todo[], state?: any) {
    state.list.push(...list);
  }

  async fetch() {
    // @ts-ignore
    const list: Todo[] = await this._modules.services.fetch();
    this.add(list);
  }
}