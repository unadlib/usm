import Module, { action, state } from 'usm-redux';


export default class Input extends Module {
  @state input = '';

  @action
  change(value: string, state?:any) {
    state.input = value;
  }

  @action
  async add() {
    // @ts-ignore
    await this._modules.interaction.services.add({ item: this.input });
    this.change('');
  }
}