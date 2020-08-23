import produce, { setAutoFreeze } from 'immer';
import {
  changeStateKey,
  identifierKey,
  stateKey,
  storeKey,
  bootstrappedKey,
} from './constant';
import { getStagedState } from './decorators';
import { Action, Store, StoreOptions } from './interface';
import { EventEmitter } from './utils';

export const createStore = (options: StoreOptions) => {
  if (typeof options !== 'object' || !Array.isArray(options.modules)) {
    throw new Error(
      `'createStore' options should be a object with a property 'modules'`
    );
  }
  const enableAutoFreeze = options.dev ?? false;
  setAutoFreeze(enableAutoFreeze);
  let state: Record<string, any> = {};
  const eventEmitter = new EventEmitter();
  const store: Store = {
    dispatch: (action: Action) => {
      state = action.state;
      eventEmitter.emit(changeStateKey);
    },
    getState: () => state,
    subscribe: (subscription) => {
      eventEmitter.on(changeStateKey, subscription);
      return () => eventEmitter.off(changeStateKey, subscription);
    },
  };
  options.modules.forEach((module) => {
    if (typeof module[stateKey] === 'undefined' || module[bootstrappedKey])
      return;
    const className = Object.getPrototypeOf(module).constructor.name;
    const identifier = `@@usm/${className}/${Math.random().toString(36)}`
    const descriptors: Record<string, PropertyDescriptor> = {
      [bootstrappedKey]: {
        enumerable: false,
        configurable: false,
        value: true,
      },
    };
    for (const key in module[stateKey]) {
      const descriptor = Object.getOwnPropertyDescriptor(module, key);
      if (typeof descriptor === 'undefined') continue;
      Object.assign(module[stateKey], {
        [key]: descriptor.value,
      });
      Object.assign(descriptors, {
        [key]: {
          enumerable: true,
          configurable: false,
          get(this: typeof module) {
            return this[stateKey]![key];
          },
          set(this: typeof module, value: unknown) {
            this[stateKey]![key] = value;
          },
        },
      });
    }
    state[identifier] = enableAutoFreeze
      ? produce({ ...module[stateKey] }, () => {})
      : module[stateKey];
    Object.assign(descriptors, {
      [identifierKey]: {
        configurable: false,
        enumerable: false,
        writable: false,
        value: identifier,
      },
      [stateKey]: {
        enumerable: false,
        configurable: false,
        get(this: typeof module) {
          const stagedState = getStagedState();
          if (stagedState) return stagedState[this[identifierKey]!];
          const currentState = this[storeKey]?.getState()[this[identifierKey]!];
          if (enableAutoFreeze && !Object.isFrozen(currentState)) {
            return Object.freeze(currentState);
          }
          return currentState;
        },
      },
      [storeKey]: {
        configurable: false,
        enumerable: false,
        get() {
          return store;
        },
      },
    });
    Object.defineProperties(module, descriptors);
  });
  return store;
};
