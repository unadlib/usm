import BaseModule, { Action, Reducer, Params, Properties } from 'usm';
import { createStore, combineReducers, ReducersMapObject } from 'redux';

export type ModuleInstance = InstanceType<typeof Module>;
export type Attribute<T = any> = {
  [P in string]: T;
}
type ActionTypes = Attribute<string>;

interface Module {
  _initialValue: Properties;
  __seletors__: Properties;
  _reducersMaps: Attribute<Callback<ActionTypes, Reducer>>;
}
interface Callback<T = undefined, S = void> {
  (params: T): S;
};

export interface Dispatch {
  (action: Action): void;
};

type Store = {
  subscribe(callback: Callback): void;
  getState(): Properties;
  dispatch: Dispatch;
};

class Module<T extends Params<T> = Params<{}>> extends BaseModule<T> {
  public _makeInstance(params: T) {
    if (Array.isArray(this._actionTypes)) {
      this._actionTypes.forEach(name => {
        this._reducersMaps[name] = (types, initialValue = this._initialValue[name]) =>
        (_state = initialValue, { type, states }) => type.indexOf(types[name]) > -1 && states ? states[name] : _state;
      });
    }
    super._makeInstance(params);
  }

  protected get _proto(): typeof Module {
    const prototype = Object.getPrototypeOf(this);
    return prototype.constructor;
  }

  protected get _reducers() {
    const reducers = this._getReducers(this.actionTypes, {});
    return this._proto.combineReducers(reducers);
  }

  protected static combineReducers(reducers: ReducersMapObject<{}, any>) {
    return combineReducers(reducers);
  }

  protected static createStore(reducer: Reducer): Store {
    return createStore(reducer);
  }

  protected _setStore(store: Store) {
    if (this._store) return;
    this._store = store;
    if (
      typeof this._store.subscribe !== 'function' ||
      typeof this._store.getState !== 'function' ||
      typeof this._store.dispatch !== 'function'
    ) {
      console.warn(`${this.constructor.name} Module did't correctly set custom 'Store'.`);
    }
  }

  public _dispatch(action: Action) {
    if (typeof this._store.dispatch === 'function') {
      return this._store.dispatch(action);
    }
  }

  public _subscribe(callback: Callback) {
    return this._store.subscribe(callback);
  }

  public _getState() {
    const key = this._proto._getModuleKey(this);
    return this.isFactoryModule || !this.getState ? (
      this.isFactoryModule ? this._store.getState() : key ? this._store.getState()[key] : {}
    ) : this.getState();
  }

  protected _getReducers(actionTypes: ActionTypes, initialValue: any) {
    const reducers = this.getReducers(actionTypes, initialValue);
    const subReducers: Properties<Reducer> = !this.isFactoryModule ? {} : Object
      .entries(this._modules)
      .reduce((reducers, [key, module]) => (
        Object.assign(reducers, { [key]: module.reducers })
      ), {});
    return {
      __$$default$$__: (state: any) => null,
      ...reducers,
      ...subReducers,
    };
  }

  public setStore(store: Store) {
    this._setStore(store);
  }

  public get reducers() {
    return this._reducers;
  }

  public get store() {
    if (!this._store) {
      throw new Error(`${this.constructor.name} Module has not been initialized...`);
    }
    return this._store;
  }

  public getReducers(actionTypes: ActionTypes, initialValue: any = {}) {
    return (this._actionTypes || []).reduce((map: Properties<Reducer>, name: string) => {
      map[name] = this._reducersMaps[name](actionTypes);
      return map;
    }, {});
  }
}

export {
  Module as default
};
