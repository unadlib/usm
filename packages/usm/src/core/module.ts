import getActionTypes from './actionTypes';
import moduleStatuses from './moduleStatuses';
import flatten from '../utils/flatten';
import DEFAULT_PROPERTY from '../utils/property';
import event from '../utils/event';


type InterfaceModule = typeof Module;
type ModuleInstance = InstanceType<InterfaceModule>;
type Properties<T = any> = {
  [P in string]?: T;
}
type Reducer<S = any, A extends Action = AnyAction> = (
  state: S | undefined,
  action: A
) => S;

interface Params<T> {
  modules?: T;
  getState?(): any;
}

interface Action {
  type: string[]|string;
  states?: Properties;
}

interface AnyAction extends Action {
  [P: string]: any;
}

interface Callback<T = any, V = void> {
  (params: T): V;
};

interface Dispatch {
  (action: Action): void;
};

interface Store {
  subscribe(call: Callback): void;
  getState(): Properties;
  dispatch?: Dispatch;
};

class Module<T = {}> {
  protected __init__: boolean;
  protected __reset__: boolean;
  public getState: any;
  public _modules: T;
  public _store: any;
  public _arguments: any;
  public _status?: string;
  public _actionTypes?: string[];
  public _dispatch?(action: Action): void;
  public _state?: any; //
  public onStateChange?(): void;
  public parentModule?: Module<any>;
  public isFactoryModule?: boolean;
  public reducers?: Reducer;
  public setStore?(store: Store): void;

  constructor(params?: Params<T>, ...args: any[]) {
    this._modules = {} as T;
    this.__init__ = false;
    this.__reset__ = false;
    this._makeInstance(this._handleArgs(params, ...args));
  }

  public _handleArgs(params?: Params<T>, ...args: any[]): Params<T> {
    if (typeof params === 'undefined') {
      return {
        modules: {} as T,
      };
    }
    return params;
  }
  
  public _makeInstance(params: Params<T>) {
    const getState = params.getState || (() => {
      const key = this._proto._getModuleKey(this);
      return this._store.getState.call(this)[key];
    });
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
    const prototype = Object.getPrototypeOf(this);
    return prototype.constructor;
  }

  private _moduleWillInitialize() {

  }

  private async _initialize(): Promise<void> {
    this._moduleWillInitialize();
    await this.moduleWillInitialize();
    this.dispatch({
      type: this.actionTypes.init,
    });
    await this._moduleDidInitialize();
  }

  private async _moduleDidInitialize(): Promise<void> {
    if (this._moduleInitializeCheck()) {
      this.__init__ = true;
      await this.moduleWillInitializeSuccess();
      this.dispatch({
        type: this.actionTypes.initSuccess,
      });
      await this.moduleDidInitialize();
    }
  }

  private _moduleInitializeCheck(): boolean {
    return !this.__init__ && Object.values(this._modules).every(module => module.ready);
  }

  protected _onStateChange(): void {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange();
    }
    if (this.pending && this._moduleInitializeCheck()) {
      this._moduleDidInitialize();
    } else if (this.ready && this._moduleResetCheck()) {
      this._moduleDidReset();
    }
  }

  private _initModule(): void {
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
    for (const key in this._modules) {
      if (typeof this.parentModule !== 'undefined') {
        const dependentModules = this.parentModule._modules[key];
        await dependentModules._resetModule();
      }
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
    if (typeof module.parentModule === 'undefined' || module.parentModule === null) {
      return null;
    }
    for (const key in module.parentModule._modules) {
      if (module.parentModule._modules[key] === module) {
        return key;
      }
    }
  }

  public static create(...args: any[]): ModuleInstance {
    const RootModule = this;
    const rootModule = new RootModule(...args);
    rootModule.isFactoryModule = true;
    const proto = Object.getPrototypeOf(rootModule).constructor;
    proto.boot(proto, rootModule);
    return rootModule;
  }

  public static boot(proto: InterfaceModule, module: ModuleInstance): void {
    if (typeof module._modules === 'object') {
      const flattenModules = flatten(module);
      Object.assign(module._modules, flattenModules);
    }
    if (typeof module.setStore === 'function') {
      module.setStore(proto._generateStore(proto, module));
    }
    module._initModule();
  }

  public static _generateStore(proto: InterfaceModule, module: ModuleInstance): Store {
    return proto.createStore(module.reducers);
  }

  protected static createStore(reducers?: Reducer): Store {
    throw new Error('`createStore` has not yet been implemented.');
  }
  
  public bootstrap() {
    this._proto.boot(this._proto, this);
  }

  public resetModule() {
    this._resetModule();
  }

  public dispatch(action: Action): void {
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
    if (typeof this._dispatch === 'function') {
      return this._dispatch(action);
    }
  }

  public get store(): Store {
    return {
      subscribe: (subscription: Callback) => event.on('state', subscription),
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

  public get pending(): boolean {
    return this.status === moduleStatuses.pending;
  }

  public get ready(): boolean {
    return this.status === moduleStatuses.ready;
  }

  public get resetting(): boolean {
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
  Module as default,
  ModuleInstance,
  Properties,
  Params,
  Action,
  Reducer,
  InterfaceModule
};
