import { StoreOptions, Service, Store, Action } from './interface';
import { EventEmitter } from './utils';
import { changeStateKey, identifierKey, stateKey, storeKey } from './constant';
import { getStagedState } from './decorators';
import produce, { setAutoFreeze } from 'immer';

// const bootstrap = (module: Service) => {};

export const createStore = (options: StoreOptions) => {
  if (typeof options !== 'object' || !Array.isArray(options.modules)) {
    throw new Error(
      `'createStore' options should be a object with a property 'modules'`
    );
  }
  const enableAutoFreeze = options.devOptions?.autoFreeze ?? false;
  setAutoFreeze(enableAutoFreeze);
  let state: Record<string, any> = {};
  const eventEmitter = new EventEmitter();
  const store: Store = {
    dispatch: (action: Action) => {
      state = action.state;
    },
    getState: () => state,
    subscribe: (subscription) => {
      eventEmitter.on(changeStateKey, subscription);
      return () => eventEmitter.off(changeStateKey, subscription);
    },
  };
  options.modules.forEach((module) => {
    if (typeof module[stateKey] === 'undefined') return;
    const identifier = Math.random().toString(32);
    const descriptors: Record<string, PropertyDescriptor> = {};
    for (const key in module[stateKey]) {
      const descriptor = Object.getOwnPropertyDescriptor(module, key);
      if (typeof descriptor === 'undefined') break;
      Object.assign(module[stateKey], {
        [key]: descriptor.value,
      });
      descriptors[key] = {
        enumerable: true,
        configurable: false,
        get(this: typeof module) {
          return this[stateKey]![key];
        },
        set(this: typeof module, value: unknown) {
          this[stateKey]![key] = value;
        },
      };
    }
    state[identifier] = enableAutoFreeze
      ? produce({ ...module[stateKey] }, () => {})
      : module[stateKey];
    Object.defineProperties(module, descriptors);
    Object.defineProperty(module, identifierKey, {
      configurable: false,
      enumerable: false,
      writable: false,
      value: identifier,
    });
    Object.defineProperty(module, stateKey, {
      configurable: false,
      enumerable: false,
      writable: false,
      get(this: typeof module) {
        const stagedState = getStagedState();
        if (stagedState) return stagedState[this[identifierKey]!];
        const currentState = this[storeKey]?.getState()[this[identifierKey]!];
        if (enableAutoFreeze && !Object.isFrozen(currentState)) {
          return Object.freeze(currentState);
        }
        return currentState;
      },
    });
    Object.defineProperty(module, storeKey, {
      configurable: false,
      enumerable: false,
      writable: false,
      get() {
        return store;
      },
    });
  });
  return store;
};
