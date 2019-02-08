import BaseModule from 'usm';
import Enum, { PropertyKey } from '../utils/enum';
import { getModuleStatusReducer, State, Reducer } from './reducers';

const __DEV__ = process.env.NODE_ENV === 'development';

export type ModuleInstance = InstanceType<typeof Module>;
export type Properties<T = any> = {
  [P in string]?: T;
}

export type Attribute<T = any> = {
  [P in string]: T;
}

type Params = {
  modules: ModuleInstance[],
}

const DEFAULT_PROPERTY = {
  configurable: false,
  enumerable: false,
  writable: false,
};

interface Callback<T = undefined, S = void> {
  (params: T): S;
};

export type ActionTypes = InstanceType<typeof Enum>;

interface Module {
  _reducersMaps: Attribute<Callback<ActionTypes, Reducer>>;
  __proto__: Proto<StaticModule>;
  __init__: boolean;
  __reset__: boolean;
  _modules: ModuleInstance[];
  _store: Store;
  _arguments: Arguments;
  _status: string;//
  _subscribe(callback: Callback): void;
  _actionTypes: string[]|undefined;
  _getState(): Properties<any>;
  _dispatch: Dispatch;
  onStateChange(): void;
  _onStateChange(): void;
  parentModule: ModuleInstance;
  getState(): Properties;
}

export interface Action {
  type: string[]|string,
}

type Proto<T> = {
  constructor: T;
};


type StaticModule = {
  _getModuleKey(module: ModuleInstance): string;
  boot(proto: StaticModule, module: ModuleInstance): void;
  combineReducers(reducers: Properties<Reducer>): Reducer;
  createStore(reducer: Reducer): any;
}

type Arguments = {
  getState(): Properties;
}

interface Dispatch {
  (action: Action): void;
};

type Store = {
  subscribe(call: Callback): void;
  getState(): Properties;
  dispatch: Dispatch;
};

class Module extends BaseModule {
  private get _reducers() {
    const reducers = this._getReducers(this.actionTypes, {});
    return this._proto.combineReducers(reducers);
  }

  private _setStore(store: Store) {
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

  private _getReducers(actionTypes: ActionTypes, initialValue: State<any>) {
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

  private _getStatusReducer(actionTypes: ActionTypes, initialValue: State<any>) {
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
