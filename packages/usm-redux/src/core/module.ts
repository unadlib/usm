import BaseModule, { PropertyKey, ActionTypes, Action, State, Reducer } from 'usm';
import { getModuleStatusReducer } from './reducers';

const __DEV__ = process.env.NODE_ENV === 'development';

export type ModuleInstance = InstanceType<typeof Module>;
export type Properties<T = any> = {
  [P in string]?: T;
}

const DEFAULT_PROPERTY = {
  configurable: false,
  enumerable: false,
  writable: false,
};

export type Attribute<T = any> = {
  [P in string]: T;
}

interface Module {
  _reducersMaps: Attribute<Callback<ActionTypes, Reducer>>;
}
interface Callback<T = undefined, S = void> {
  (params: T): S;
};

interface Dispatch {
  (action: Action): void;
};

type Store = {
  subscribe(call: Callback): void;
  getState(): Properties;
  dispatch: Dispatch;
};

class Module extends BaseModule implements Module {
  protected get _reducers() {
    const reducers = this._getReducers(this.actionTypes, {});
    return this._proto.combineReducers(reducers);
  }

  protected _setStore(store: Store) {
    if (this._store) return;
    Object.defineProperty(this, '_store', {
      ...DEFAULT_PROPERTY,
      value: store,
    });
    const {
      subscribe,
      getState,
      dispatch,
    } = this._store;
    if (
      __DEV__ &&
      typeof subscribe !== 'function' ||
      typeof getState !== 'function' ||
      typeof dispatch !== 'function'
    ) {
      console.warn(`${this.constructor.name} Module did't correctly set custom 'Store'.`);
    }
    Object.defineProperties(this, {
      _dispatch: {
        ...DEFAULT_PROPERTY,
        value: dispatch,
      },
      _getState: {
        ...DEFAULT_PROPERTY,
        value: !this.parentModule || !this.getState ? getState : this.getState,
      },
      _subscribe: {
        ...DEFAULT_PROPERTY,
        value: subscribe,
      }
    });
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
      ...this._getStatusReducer(actionTypes, initialValue),
    };
  }

  protected _getStatusReducer(actionTypes: ActionTypes, initialValue: State<any>) {
    return this._isListening ? {
      status: getModuleStatusReducer(actionTypes, initialValue.status),
    } : {};
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
