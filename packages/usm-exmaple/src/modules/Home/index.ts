import Module from 'usm-redux';

export default class Home extends Module {
  async moduleDidInitialize() {
    await this._modules.viewList.fetch();
    console.log(this._modules.viewList.list);
  }
}
