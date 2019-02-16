import BaseModule, { PropertyKey, ActionTypes, Action, State, Reducer } from 'usm';
import { Store } from 'vuex';

const DEFAULT_PROPERTY = {
  configurable: false,
  enumerable: false,
  writable: false,
};

export default class Module extends BaseModule {
  protected _setStore(_store) {
    if (this._store) return;
    Object.defineProperties(this,  {
      _store:{
        ...DEFAULT_PROPERTY,
        value: _store,
      }
    });
  }

  public get mutations() {
    return typeof this._mutations === 'undefined' ? {} : Object.entries(this._mutations).reduce((map, [name, fn]) =>
      Object.assign(map, {[this.actionTypes[name]]: fn})
    , {});
  }

  public static _generateStore(proto, module) {
    return proto.createStore(module);
  }

  protected _getState() {
    return this._state;
  }

  protected static createStore(instance) {
    return new Store(instance);
  }

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
