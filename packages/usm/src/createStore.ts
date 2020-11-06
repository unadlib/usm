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
  const enableAutoFreeze = options.strict ?? false;
  setAutoFreeze(enableAutoFreeze);
  let state: Record<string, any> = {};
  const identifiers = new Set<string>();
  const eventEmitter = new EventEmitter();
  const store: Store = {
    dispatch: (action: Action) => {
      state = action._state;
      eventEmitter.emit(changeStateKey);
    },
    getState: () => state,
    subscribe: (subscription) => {
      eventEmitter.on(changeStateKey, subscription);
      return () => eventEmitter.off(changeStateKey, subscription);
    },
  };
  options.modules.forEach((module, index) => {
    const className = Object.getPrototypeOf(module).constructor.name;
    if (typeof module[stateKey] === 'undefined' || module[bootstrappedKey]) {
      if (__DEV__) {
        if (module[bootstrappedKey]) {
          console.warn(
            `The module with an index of ${index} and a name of ${className} in the module list is a duplicate module.`
          );
        }
      }
    }
    let identifier = module.name;
    if (identifier === null || typeof identifier === 'undefined') {
      identifier = `@@usm/${className}/${Math.random().toString(36)}`;
    }
    if (typeof identifier !== 'string') {
      if (__DEV__) {
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
    if (identifiers.has(identifier)) {
      identifier += `${index}`;
    }
    identifiers.add(identifier);
    const descriptors: Record<string, PropertyDescriptor> = {
      [bootstrappedKey]: {
        enumerable: false,
        configurable: false,
        value: true,
      },
    };
    if (module[stateKey]) {
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
        [stateKey]: {
          enumerable: false,
          configurable: false,
          get(this: typeof module) {
            const stagedState = getStagedState();
            if (stagedState) return stagedState[this[identifierKey]!];
            const currentState = this[storeKey]?.getState()[
              this[identifierKey]!
            ];
            if (enableAutoFreeze && !Object.isFrozen(currentState)) {
              return Object.freeze(currentState);
            }
            return currentState;
          },
        },
      });
    }
    Object.assign(descriptors, {
      [identifierKey]: {
        configurable: false,
        enumerable: false,
        writable: false,
        value: identifier,
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
