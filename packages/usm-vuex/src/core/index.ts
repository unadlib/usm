import Vuex, { Store, StoreOptions } from 'vuex';
import Vue from 'vue';
import BaseModule, { Properties, InterfaceModule } from 'usm';

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

interface StoreType {
  commit(type: string, args:[]): void;
  getters: Properties;
}

interface Module {
  _mutations?: any;
  _getters?: any;
}
class Module extends BaseModule implements VuexModule {
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
    return typeof this._mutations === 'undefined' ? {} : Object.entries(this._mutations).reduce((map, [name, fn]) =>
      Object.assign(map, {[this.actionTypes[name]]: fn})
    , {});
  }

  public get getters() {
    return typeof this._getters === 'undefined' ? {} : this._getters;
  }

  public static _generateStore(proto: InterfaceModule, module: ModuleInstance) {
    Vue.use(Vuex);
    return proto.createStore(module as any);
  }  

  protected static createStore(instance: any): StoreOptions<any> {
    return new Store(instance);
  }

  public setStore(store: any) {
    this._setStore(store);
  }

  // todo fix StoreType
  public get store(): any {
    const parentModule = this.parentModule || this;
    // todo fix StoreType
    const _store: any = parentModule._store;
    if (!_store) {
      throw new Error(`${this.constructor.name} Module has not been initialized...`);
    }
    return _store;
  }
}

export {
  Module as default
}
