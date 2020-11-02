import produce, {
  setAutoFreeze,
  enablePatches as enablePatchesWithImmer,
} from 'immer';
import {
  createStore as createStoreWithRedux,
  combineReducers,
  ReducersMapObject,
  PreloadedState,
  Middleware,
  applyMiddleware,
} from 'redux';
import { stateKey, storeKey, bootstrappedKey, actionKey } from './constant';
import { getStagedState } from './decorators';
import { Action, StoreOptions, Store } from './interface';

let enablePatches: boolean;

export const getPatchesToggle = () => enablePatches;

export const createStore = (
  options: StoreOptions,
  preloadedState?: PreloadedState<any>,
  middleware: Middleware[] = []
) => {
  if (typeof options !== 'object' || !Array.isArray(options.modules)) {
    throw new Error(
      `'createStore' options should be a object with a property 'modules'`
    );
  }
  const enableAutoFreeze = options.strict ?? false;
  enablePatches = options.enablePatches ?? false;
  if (enablePatches) enablePatchesWithImmer();
  setAutoFreeze(enableAutoFreeze);
  const reducers: ReducersMapObject = {};
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
      return;
    }
    let identifier = module.name;
    if (identifier === null || typeof identifier === 'undefined') {
      identifier = `@@usm-redux/${className}/${Math.random().toString(36)}`;
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
    if (typeof reducers[identifier] === 'function') {
      identifier += `${index}`;
    }
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
      name: {
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
          if (stagedState) return stagedState[identifier!];
          const currentState = this[storeKey]?.getState()[identifier!];
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
  const storeWithRedux = createStoreWithRedux(
    combineReducers(reducers),
    preloadedState,
    applyMiddleware(...middleware)
  );
  store = {
    dispatch: storeWithRedux.dispatch,
    getState: storeWithRedux.getState,
    subscribe: storeWithRedux.subscribe,
  };
  return store;
};
