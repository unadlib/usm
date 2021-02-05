import produce, {
  setAutoFreeze,
  enablePatches as enablePatchesWithImmer,
} from 'immer';
import {
  createStore as createStoreWithRedux,
  combineReducers,
  ReducersMapObject,
  PreloadedState,
  applyMiddleware,
  Store as ReduxStore,
} from 'redux';
import {
  stateKey,
  storeKey,
  bootstrappedKey,
  actionKey,
  identifierKey,
  subscriptionsKey,
} from './constant';
import { getStagedState } from './utils/index';
import { Action, StoreOptions, Store, Subscription, Config } from './interface';

let enablePatches: boolean;

export const getPatchesToggle = () => enablePatches;

export const createStore = (
  options: StoreOptions,
  preloadedState?: PreloadedState<any>,
  config: Config = {}
) => {
  const {
    reduxMiddleware = [],
    handleReducers = (reducers) => combineReducers(reducers),
  } = config;
  if (typeof options !== 'object' || !Array.isArray(options.modules)) {
    throw new Error(
      `'createStore' options should be a object with a property 'modules'`
    );
  }
  const enableAutoFreeze = options.strict ?? __DEV__;
  enablePatches = config.enablePatches ?? false;
  if (enablePatches) enablePatchesWithImmer();
  setAutoFreeze(enableAutoFreeze);
  const identifiers = new Set<string>();
  const reducers: ReducersMapObject = {};
  const subscriptions: Subscription[] = [];
  let store: Store;
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
      identifier = `@@usm-redux/${className}/${Math.random().toString(36)}`;
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
      const initState = enableAutoFreeze
        ? produce({ ...module[stateKey] }, () => {})
        : module[stateKey];

      const serviceReducers = Object.entries(initState!).reduce(
        (serviceReducersMapObject: ReducersMapObject, [key, value]) => {
          // support pure reducer
          if (typeof value === 'function') {
            return Object.assign(serviceReducersMapObject, {
              [key]: value,
            });
          }
          const reducer = (state = value, action: Action) => {
            return action._usm === actionKey
              ? action._state[identifier!][key]
              : state;
          };
          return Object.assign(serviceReducersMapObject, {
            [key]: reducer,
          });
        },
        {}
      );
      const reducer = combineReducers(serviceReducers);
      Object.assign(reducers, {
        [identifier]: reducer,
      });

      Object.assign(descriptors, {
        [stateKey]: {
          enumerable: false,
          configurable: false,
          get(this: typeof module) {
            const stagedState = getStagedState();
            if (stagedState) return stagedState[identifier!];
            const currentState = this[storeKey]?.getState()[identifier!];
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
    if (Array.isArray(module[subscriptionsKey])) {
      Array.prototype.push.apply(subscriptions, module[subscriptionsKey]!);
    }
  });
  const storeWithRedux = createStoreWithRedux(
    handleReducers(reducers),
    preloadedState,
    applyMiddleware(...reduxMiddleware)
  );
  store = {
    dispatch: storeWithRedux.dispatch,
    getState: storeWithRedux.getState,
    subscribe: storeWithRedux.subscribe,
  };
  for (const subscribe of subscriptions) {
    subscribe();
  }
  return store as ReduxStore;
};
