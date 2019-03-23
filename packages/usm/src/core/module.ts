import getActionTypes from './actionTypes';
import moduleStatuses from './moduleStatuses';
import Enum from '../utils/enum';
import flatten from '../utils/flatten';
import event from '../utils/event';

export type State<T> = T;
export interface Reducer {
  (state: State<any>, action: Action): State<any>;
}

export type ModuleInstance = InstanceType<typeof Module>;
export type Properties<T = any> = {
  [P in string]?: T;
}

export type Attribute<T = any> = {
  [P in string]: T;
}

type Params = {
  getState?(): Properties;
  modules: Attribute<ModuleInstance>;
}

const DEFAULT_PROPERTY = {
  configurable: false,
  enumerable: false,
  writable: false,
};

interface Callback<T = undefined, S = void> {
  (params: T): S;
};

type Subscription = {
  (): void;
}


export type ActionTypes = InstanceType<typeof Enum>;

interface Module extends Properties {
  __proto__: Proto<StaticModule>;
  __init__: boolean;
  __reset__: boolean;
  _modules: Attribute<ModuleInstance>;
  _store: Store;
  _arguments: Params;
  _status: string;
  _subscribe(callback: Callback): void;
  _actionTypes: string[]|undefined;
  _dispatch(action: Action): void;
  _onStateChange(): void;
  _state?: Properties;
  parentModule: ModuleInstance;
  getState(): Properties;
  onStateChange?(): void;
  setStore?(store: Store): void;
}

export interface Action {
  type: string[]|string;
  states?: Properties;
}

type Proto<T> = {
  constructor: T;
};


export type StaticModule = {
  _getModuleKey(module: ModuleInstance): string;
  boot(proto: StaticModule, module: ModuleInstance): void;
  combineReducers(reducers: Properties<Reducer>): Reducer;
  createStore<T = Reducer>(option: T): any;
  _generateStore(proto: StaticModule, module: ModuleInstance): Store;
}

interface Dispatch {
  (action: Action): void;
};

type Store = {
  subscribe(call: Callback): void;
  getState(): Properties;
  dispatch: Dispatch;
};

class Module {
  constructor(...args: any[]) {
    this._makeInstance(this._handleArgs(...args));
  }

  private _handleArgs(...args: any[]): Params {
    const params: Params = args[0];
    if (typeof params === 'undefined') {
      return {
        modules: {}
      };
    }
    return params;
  }
  
  private _makeInstance(params: Params) {
    params.modules = params.modules || {};
    const key = this._proto._getModuleKey(this);
    const getState = params.getState || (() => (this._store.getState.call(this)[key]));
    Object.defineProperties(this, {
      _arguments: {
        ...DEFAULT_PROPERTY,
        value: params,
      },
      _modules: {
        ...DEFAULT_PROPERTY,
        value: params.modules,
      },
      _status: {
        ...DEFAULT_PROPERTY,
        writable: true,
        value: moduleStatuses.initial,
      },
      getState: {
        ...DEFAULT_PROPERTY,
        value: getState,
      },
    });
  }

  protected get _proto() {
    return this.__proto__.constructor;
  }

  private _moduleWillInitialize() {

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

  _onStateChange() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange();
    }
    if (this.pending && this._moduleInitializeCheck()) {
      this._moduleDidInitialize();
    } else if (this.ready && this._moduleResetCheck()) {
      this._moduleDidReset();
    }
  }

  private _initModule() {
    event.on('module', this._onStateChange.bind(this));
    this._initialize();
    Object.values(this._modules).forEach(module => {
      module.parentModule = this;
      if (typeof module.setStore === 'function') {
        module.setStore(this._store);
      }
      module._initModule();
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
    await this._moduleDidReset();
    await this._moduleDidInitialize();
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

  protected _getState() {
    return this._state;
  }

  private _getActionTypes() {
    return getActionTypes(this.getActionTypes(), this.constructor.name);
  }

  private static _getModuleKey(module: ModuleInstance) {
    const { name } = module.constructor;
    return name[0].toLowerCase() + name.slice(1);
  }

  public static create(...args: any[]) {
    const RootModule = this;
    const rootModule = new RootModule(...args);
    const proto = rootModule.__proto__.constructor;
    proto.boot(proto, rootModule);
    return rootModule;
  }

  public static boot(proto: StaticModule, module: ModuleInstance) {
    if (typeof module._modules === 'object') {
      const flattenModules = flatten(module);
      Object.assign(module._modules, flattenModules);
    }
    if (typeof module.setStore === 'function') {
      module.setStore(proto._generateStore(proto, module));
    }
    module._initModule();
  }

  public static _generateStore(proto: StaticModule, module: ModuleInstance) {
    return proto.createStore(module.reducers);
  }
  

  public bootstrap() {
    this._proto.boot(this._proto, this);
  }

  public resetModule() {
    this._resetModule();
  }

  public dispatch(action: Action) {
    if (typeof action.type === 'string') {
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

  public get store() {
    return {
      subscribe: (subscription: Subscription) => event.on('state', subscription),
      getState: () => this._state || {},
    }
  }

  public get actionTypes() {
    return this._getActionTypes();
  }

  public get state() {
    return this._getState() || {};
  }

  public get status() {
    return this._status;
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

  public get modules() {
    return this._modules;
  }

  public getActionTypes() {
    return this._actionTypes;
  }

  public moduleWillInitialize() {}

  public moduleWillInitializeSuccess() {}

  public moduleDidInitialize() {}

  public moduleWillReset() {}

  public moduleDidReset() {}
}

export {
  Module as default
};
