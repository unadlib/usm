import { configure, makeObservable, runInAction, autorun } from 'mobx';
import { EventEmitter } from './utils';
import {
  changeStateKey,
  identifierKey,
  stateKey,
  storeKey,
  computedKey,
  observableKey,
  actionKey,
  bootstrappedKey,
} from './constant';
import type { StoreOptions, Store, Action } from './interface';

export const createStore = (options: StoreOptions) => {
  const autoRunComputed = options.autoRunComputed ?? true;
  const strict = options.strict ?? false;
  configure({
    enforceActions: 'always',
    computedRequiresReaction: !autoRunComputed,
    reactionRequiresObservable: strict,
    observableRequiresReaction: strict,
    disableErrorBoundaries: strict,
  });
  let state: Record<string, any> = {};
  const identifiers = new Set<string>();
  const eventEmitter = new EventEmitter();
  const store: Store = {
    dispatch: (action: Action) => {
      action._changeState.apply(null, action.params);
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
      identifier = `@@usm-mobx/${className}/${Math.random().toString(36)}`;
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
    const initialValue: Record<string, any> = {};
    if (module[stateKey]) {
      state[identifier] = {};
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
        [stateKey]: {
          enumerable: false,
          configurable: false,
          get(this: typeof module) {
            return state[identifier!];
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
    makeObservable(module, {
      ...(module[computedKey] ?? {}),
      ...(module[observableKey] ?? {}),
      ...(module[actionKey] ?? {}),
    });
    if (module[stateKey]) {
      runInAction(() => {
        for (const key in initialValue) {
          module[key] = initialValue[key];
        }
      });
    }
    if (autoRunComputed && module[computedKey]) {
      for (const key in module[computedKey]) {
        autorun(() => module[key]);
      }
    }
  });
  if (options.strict) {
    Object.freeze(state);
  }
  return store;
};
