import Module, { action, state } from 'usm-redux';

interface Todo {
  item: string;
}

export default class ViewList extends Module {  
  @state list: Todo[] = [];

  @action
  add(list: Todo, state?: any) {
    state.list.push(...list);
  }

  async fetch() {
    const list: Todo[] = await this._modules.interaction.services.fetch();
    this.add(list);
  }
}