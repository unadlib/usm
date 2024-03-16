import { create } from 'mutative';
import {
  createStore as createStoreWithRedux,
  combineReducers,
  ReducersMapObject,
  Reducer,
  Store as ReduxStore,
} from 'redux';
import {
  stateKey,
  storeKey,
  bootstrappedKey,
  identifierKey,
  subscriptionsKey,
  usm,
  strictKey,
  enablePatchesKey,
} from './constant';
import { getStagedState, isEqual } from './utils/index';
import {
  Action,
  StoreOptions,
  Store,
  Subscription,
  Config,
  Service,
} from './interface';
import { Signal, signal } from './signal';

export const createStore = (
  options: StoreOptions,
  preloadedState?: any,
  config: Config = {}
) => {
  const {
    reduxEnhancer,
    handleReducers = (reducers) => combineReducers(reducers),
  } = config;
  if (typeof options !== 'object' || !Array.isArray(options.modules)) {
    throw new Error(
      `'createStore' options should be a object with a property 'modules'`
    );
  }
  const strict = options.strict ?? false;
  const enablePatches = config.enablePatches ?? false;
  const identifiers = new Set<string>();
  const reducers: ReducersMapObject = {};
  const subscriptions: Subscription[] = [];
  let store: Store;
  options.modules.forEach((module, index) => {
    if (typeof module !== 'object' || module === null) return;
    const service: Service = module;
    const className = Object.getPrototypeOf(service).constructor.name;
    if (typeof service[stateKey] === 'undefined' || service[bootstrappedKey]) {
      if (__DEV__) {
        if (service[bootstrappedKey]) {
          console.warn(
            `The module with an index of ${index} and a name of ${className} in the module list is a duplicate module.`
          );
        }
      }
    }
    let identifier = service[identifierKey] ?? service.name;
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
    if (service[stateKey]) {
      const signalMap: Record<string, Signal> = {};
      for (const key in service[stateKey]) {
        const descriptor = Object.getOwnPropertyDescriptor(service, key);
        if (typeof descriptor === 'undefined') continue;
        Object.assign(service[stateKey], {
          [key]: descriptor.value,
        });
        Object.assign(descriptors, {
          [key]: {
            enumerable: true,
            configurable: false,
            get(this: typeof service) {
              const current = this[stateKey]![key];
              const stagedState = getStagedState();
              if (stagedState) {
                return current;
              }
              if (
                !stagedState &&
                signalMap[key] &&
                !isEqual(signalMap[key].value, current)
              ) {
                signalMap[key].value = current;
              }
              return signalMap[key].value;
            },
            set(this: typeof service, value: unknown) {
              this[stateKey][key] = value;
            },
          },
        });
      }
      const initState = strict
        ? create({ ...service[stateKey] }, () => {}, {
            strict,
            enableAutoFreeze: strict,
          })
        : service[stateKey];

      const serviceReducers = Object.entries(initState).reduce(
        (serviceReducersMapObject: ReducersMapObject, [key, value]) => {
          // support pure reducer
          if (typeof value === 'function') {
            return Object.assign(serviceReducersMapObject, {
              [key]: value,
            });
          }
          signalMap[key] = signal(value);
          const current = signalMap[key];
          const reducer = (state = value, action: Action) => {
            if (action._usm === usm) {
              const nextState = action._state[identifier][key];
              if (!isEqual(nextState, state)) {
                current.value = nextState;
              }
              return nextState;
            }
            return state;
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
          get(this: typeof service) {
            const stagedState = getStagedState();
            if (stagedState) return stagedState[identifier];
            const currentState = this[storeKey]?.getState()[identifier];
            if (strict && !Object.isFrozen(currentState)) {
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
        value: identifier,
      },
      [strictKey]: {
        configurable: false,
        enumerable: false,
        value: strict,
      },
      [enablePatchesKey]: {
        configurable: false,
        enumerable: false,
        value: enablePatches,
      },
      [storeKey]: {
        configurable: false,
        enumerable: false,
        get() {
          return store;
        },
      },
    });
    Object.defineProperties(service, descriptors);
    if (Array.isArray(service[subscriptionsKey])) {
      Array.prototype.push.apply(subscriptions, service[subscriptionsKey]);
    }
  });
  const storeWithRedux = createStoreWithRedux(
    handleReducers(reducers),
    preloadedState,
    reduxEnhancer
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
