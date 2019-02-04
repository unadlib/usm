import getActionTypes from './actionTypes';
import moduleStatuses from './moduleStatuses';
import Enum, { PropertyKey } from '../utils/enum';
import { getModuleStatusReducer, State, Reducer } from './reducers';
import flatten from '../utils/flatten';
import event from '../utils/event';

const __DEV__ = process.env.NODE_ENV === 'development';

export type ModuleInstance = InstanceType<typeof Module>;
export type Properties<T = any> = {
  [P in string]?: T;
}
type Params = {
  modules: ModuleInstance[],
}

const DEFAULT_PROPERTY = {
  configurable: false,
  enumerable: false,
  writable: false,
};

interface Callback<T = undefined> {
  (params: T): void;
};

export type ActionTypes = InstanceType<typeof Enum>;

interface Module {
  _reducersMaps: Properties<Callback<ActionTypes>>;
  __proto__: StaticModule;
  __init__: boolean;
  __reset__: boolean;
  _modules: ModuleInstance[];
  _store: Store;
  _arguments: Arguments;
  _status: string;//
  _subscribe(callback: Callback): void;
  _actionTypes: ActionTypes|undefined;
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

type StaticModule = {
  _getModuleKey(): void;
  boot(): void;
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

class Module implements Module {
  constructor(...args:[]) {
    const params: Params = this._handleArgs(...args);
    this._makeInstance(params);
  }

  private _handleArgs(...args:[]): Params {
    return args[0];
  }
  
  private _makeInstance(params: Params) {
    params.modules = params.modules || [];
    const modulesMapping = params.modules
      .reduce((mapping, module) => {
        const key = this._proto._getModuleKey(module);
        return Object.assign(mapping, {
          [key]: module,
        });
      }, {});
    Object.defineProperties(this, {
      _arguments: {
        ...DEFAULT_PROPERTY,
        value: params,
      },
      _modules: {
        ...DEFAULT_PROPERTY,
        value: modulesMapping,
      }
    });
    const key = this._proto._getModuleKey(this);
    this.getState = this._arguments.getState || (() => (this._store.getState.call(this)[key]));
    if (!this._isListening) {
      this._status = moduleStatuses.initial;
    }
  }

  private get _isListening() {
    return typeof this.onStateChange === 'function';
  }

  private get _proto() {
    return this.__proto__.constructor;
  }

  private get _reducers() {
    const reducers = this._getReducers(this.actionTypes, {});
    return this._proto.combineReducers(reducers);
  }

  _moduleWillInitialize() {
    // return this._getState();
  }

  private async _initialize() {
    this._moduleWillInitialize();
    await this.moduleWillInitialize();
    this.dispatch({
      type: this.actionTypes.init,
    });
    await this._moduleDidInitialize();
  }

  private async _moduleDidInitialize() {
    if (this._moduleInitializeCheck()) {
      this.__init__ = true;
      await this.moduleWillInitializeSuccess();
      this.dispatch({
        type: this.actionTypes.initSuccess,
      });
      await this.moduleDidInitialize();
    }
  }

  private _moduleInitializeCheck() {
    return !this.__init__ && Object.values(this._modules).every(module => module.ready);
  }

  private _onStateChange() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange();
    }
    if (this.pending && this._moduleInitializeCheck()) {
      this._moduleDidInitialize();
    } else if (this.ready && this._moduleResetCheck()) {
      this._moduleDidReset();
    }
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

  private _initModule() {
    if (this._isListening) {
      this._subscribe(this._onStateChange.bind(this));
    } else {
      event.on('module', this._onStateChange.bind(this));
    }
    this._initialize();
    Object.values(this._modules).forEach(module => {
      module.parentModule = this;
      module.setStore(this._store);
    });
  }

  private async _moduleWillReset() {
    for (const index in this._modules) {
      const parentModule = this.parentModule || this;
      const dependentModules = parentModule._modules[index];
      await dependentModules._resetModule();
    }
    await this.moduleWillReset();
  }

  private async _resetModule() {
    await this._moduleWillReset();
    this.dispatch({
      type: this.actionTypes.reset,
    });
    await this._initialize();
    this.__init__ = false;
    this.__reset__ = true;
    await this._moduleDidInitialize();
    await this._moduleDidReset();
  }

  private _moduleResetCheck() {
    return this.__reset__ && Object.values(this._modules).every(module => module.ready);
  }

  private async _moduleDidReset() {
    if (this._moduleResetCheck()) {
      this.__reset__ = false;
      await this.moduleDidReset();
    }
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

  private _getActionTypes() {
    return getActionTypes(this.getActionTypes(), this.constructor.name);
  }

  private static _getModuleKey(module: ModuleInstance) {
    return module.constructor.name.toLowerCase();
  }

  public static create(config) {
    const RootModule = this;
    const rootModule = new RootModule(config);
    const proto = rootModule.__proto__.constructor;
    proto.boot(proto, rootModule);
    return rootModule;
  }

  public static boot(proto: Module, module: ModuleInstance) {
    if (typeof module._modules === 'object') {
      const flattenModules = flatten(module);
      Object.assign(module._modules, flattenModules);
    }
    module.setStore(proto.createStore(module.reducers));
  }

  public bootstrap() {
    this._proto.boot(this._proto, this);
  }

  public resetModule() {
    this._resetModule();
  }

  public setStore(store: Store) {
    this._setStore(store);
    this._initModule();
  }

  public dispatch(action: Action) {
    if (!this._isListening && typeof action.type === 'string') {
      const index = [
        this.actionTypes.init,
        this.actionTypes.reset,
        this.actionTypes.initSuccess,
      ].indexOf(action.type);
      const moduleStatus = [
        moduleStatuses.pending,
        moduleStatuses.resetting,
        moduleStatuses.ready
      ][index];
      if (index > -1) {
        this._status = moduleStatus;
        return event.emit('module');
      }
    }
    return this._dispatch(action);
  }

  public get actionTypes() {
    return this._getActionTypes();
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

  public get state() {
    return this._getState();
  }

  public get status() {
    return this._isListening ? this.state.status : this._status;
  }

  public get pending() {
    return this.status === moduleStatuses.pending;
  }

  public get ready() {
    return this.status === moduleStatuses.ready;
  }

  public get resetting() {
    return this.status === moduleStatuses.resetting;
  }

  public getActionTypes() {
    return this._actionTypes || [];
  }

  public getReducers(actionTypes: ActionTypes, initialValue: State<any> = {}) {
    return (this._actionTypes || []).reduce((map: Properties<Reducer>, name: PropertyKey) => {
      map[name] = this._reducersMaps[name](actionTypes);
      return map;
    }, {});
  }

  // When define `onStateChange`, this module status will use reducer. 
  // public onStateChange() {}

  public moduleWillInitialize() {}

  public moduleWillInitializeSuccess() {}

  public moduleDidInitialize() {}

  public moduleWillReset() {}

  public moduleDidReset() {}
}

export {
  Module as default
};
