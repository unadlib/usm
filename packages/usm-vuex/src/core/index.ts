import Vuex, { Store, StoreOptions } from 'vuex';
import Vue from 'vue';
import BaseModule, { Properties, StaticModule } from 'usm';

const DEFAULT_PROPERTY = {
  configurable: false,
  enumerable: false,
  writable: false,
};
type ModuleInstance = InstanceType<typeof Module>;

export type VuexModule =  {
  setStore(store: StoreOptions<any>): void;
  _mutations?: Properties;
  _state?: Properties;
}
export default class Module extends BaseModule implements VuexModule {
  protected _setStore(_store: StoreOptions<any>) {
    if (this._store) return;
    Object.defineProperties(this,  {
      _store:{
        ...DEFAULT_PROPERTY,
        value: _store,
      }
    });
  }

  public get mutations() {
    // @ts-ignore
    return typeof this._mutations === 'undefined' ? {} : Object.entries(this._mutations).reduce((map, [name, fn]) =>
      Object.assign(map, {[this.actionTypes[name]]: fn})
    , {});
  }

  public static _generateStore(proto: StaticModule, module: ModuleInstance) {
    Vue.use(Vuex);
    return proto.createStore(module);
  }  

  protected static createStore(instance: ModuleInstance): StoreOptions<any> {
    return new Store(instance);
  }
  // @ts-ignore
  public setStore(store) {
    this._setStore(store);
  }

  public get store() {
    const parentModule = this.parentModule || this;
    const _store = parentModule._store;
    if (!_store) {
      throw new Error(`${this.constructor.name} Module has not been initialized...`);
    }
    return _store;
  }
}
