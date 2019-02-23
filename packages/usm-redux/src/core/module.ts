import BaseModule, { PropertyKey, ActionTypes, Action, State, Reducer } from 'usm';
import { createStore, combineReducers, ReducersMapObject } from 'redux';

const __DEV__ = process.env.NODE_ENV === 'development';

export type ModuleInstance = InstanceType<typeof Module>;
export type Properties<T = any> = {
  [P in string]?: T;
}

export type Attribute<T = any> = {
  [P in string]: T;
}

interface Module {
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

class Module extends BaseModule implements Module {
  protected get _reducers() {
    const reducers = this._getReducers(this.actionTypes, {});
    return this._proto.combineReducers(reducers);
  }

  protected static combineReducers(reducers: ReducersMapObject<{}, any>) {
    return combineReducers(reducers);
  }

  protected static createStore(reducer: Reducer) {
    return createStore(reducer);
  }

  protected _setStore(store: Store) {
    if (this._store) return;
    this._store = store;
    if (
      __DEV__ &&
      typeof this._store.subscribe !== 'function' ||
      typeof this._store.getState !== 'function' ||
      typeof this._store.dispatch !== 'function'
    ) {
      console.warn(`${this.constructor.name} Module did't correctly set custom 'Store'.`);
    }
  }

  public _dispatch(action: Action) {
    return this._store.dispatch(action);
  }

  public _subscribe(callback: Callback) {
    return this._store.subscribe(callback);
  }

  public _getState() {
    return !this.parentModule || !this.getState ? this._store.getState() : this.getState();
  }

  protected _getReducers(actionTypes: ActionTypes, initialValue: State<any>) {
    const reducers = this.getReducers(actionTypes, initialValue);
    const subReducers: Properties<Reducer> = Object
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

  public getReducers(actionTypes: ActionTypes, initialValue: State<any> = {}) {
    return (this._actionTypes || []).reduce((map: Properties<Reducer>, name: PropertyKey) => {
      map[name] = this._reducersMaps[name](actionTypes);
      return map;
    }, {});
  }
}

export {
  Module as default
};
