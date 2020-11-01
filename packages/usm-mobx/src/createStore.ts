import { configure, makeObservable, runInAction } from 'mobx';
import { EventEmitter } from './utils';
import {
  changeStateKey,
  identifierKey,
  stateKey,
  storeKey,
  computedKey,
  observableKey,
  actionKey,
} from './constant';
import type { StoreOptions, Store, Action } from './interface';

export const createStore = (options: StoreOptions) => {
  configure({
    enforceActions: 'always',
    computedRequiresReaction: false,
    reactionRequiresObservable: options.strict,
    observableRequiresReaction: options.strict,
    disableErrorBoundaries: options.strict,
  });
  let state: Record<string, any> = {};
  const eventEmitter = new EventEmitter();
  const store: Store = {
    dispatch: (action: Action) => {
      action._changeState();
      eventEmitter.emit(changeStateKey);
    },
    getState: () => state,
    subscribe: (subscription) => {
      eventEmitter.on(changeStateKey, subscription);
      return () => eventEmitter.off(changeStateKey, subscription);
    },
  };
  options.modules.forEach((module, index) => {
    if (typeof module[stateKey] === 'undefined') return;
    const className = Object.getPrototypeOf(module).constructor.name;
    let identifier = module.name;
    if (identifier === null || typeof identifier === 'undefined') {
      identifier = `@@usm-mobx/${className}/${Math.random().toString(36)}`;
    }
    if (typeof identifier !== 'string') {
      if (process.env.NODE_ENV === 'development') {
        console.error(`
          Since '${className}' module has set the module state, '${className}' module must set a unique and valid class property 'name' to be used as the module index.
          Example:
            class FooBar {
              name = 'FooBar'; // <- add the 'name' property.
            }
        `);
      } else {
        throw new Error(
          `'${className}' module 'name' property should be defined as a valid 'string'.`
        );
      }
    }
    if (typeof state[identifier] !== 'undefined') {
      identifier += `${index}`;
    }
    state[identifier] = {};
    const descriptors: Record<string, PropertyDescriptor> = {};
    const initialValue: Record<string, any> = {};
    for (const key in module[stateKey]) {
      Object.defineProperty(state[identifier], key, {
        get() {
          return module[key];
        },
        set(value: unknown) {
          runInAction(() => {
            module[key] = value;
          });
        },
      });
      initialValue[key] = module[key];
      module[key] = null;
    }
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
          return state[identifier!];
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
    makeObservable(module, {
      ...module[computedKey],
      ...module[observableKey],
      ...module[actionKey],
    });
    runInAction(() => {
      for (const key in initialValue) {
        module[key] = initialValue[key];
      }
    });
  });
  if (options.strict) {
    Object.freeze(state);
  }
  return store;
};
