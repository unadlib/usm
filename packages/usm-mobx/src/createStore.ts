import {
  configure,
  makeObservable,
  runInAction,
  autorun,
  observable,
} from 'mobx';
import { EventEmitter } from './utils/index';
import {
  changeStateKey,
  identifierKey,
  stateKey,
  storeKey,
  computedKey,
  observableKey,
  actionKey,
  bootstrappedKey,
  subscriptionsKey,
} from './constant';
import type {
  StoreOptions,
  Store,
  Action,
  Subscription,
  Config,
  Service,
} from './interface';

export const createStore = (
  options: StoreOptions,
  preloadedState?: Record<string, any>,
  config: Config = {}
) => {
  const autoRunComputed = config.autoRunComputed ?? true;
  const strict = options.strict ?? __DEV__;
  configure({
    enforceActions: 'always',
    computedRequiresReaction: !autoRunComputed,
    reactionRequiresObservable: strict,
    observableRequiresReaction: strict,
    disableErrorBoundaries: strict,
  });
  let state: Record<string, any> = {};
  const subscriptions: Subscription[] = [];
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
    if (service[stateKey]) {
      state[identifier] = {};
      Object.assign(service, {
        [observableKey]: {},
      });
      for (const key in service[stateKey]) {
        service[observableKey][key] = observable;
        Object.defineProperty(state[identifier], key, {
          get() {
            return service[key];
          },
          set(value: unknown) {
            runInAction(() => {
              service[key] = value;
            });
          },
        });
        initialValue[key] = service[key];
        service[key] = null;
        if (
          preloadedState &&
          preloadedState[identifier] &&
          Object.hasOwnProperty.call(preloadedState[identifier], key)
        ) {
          initialValue[key] = preloadedState[identifier][key];
        }
      }
      Object.assign(descriptors, {
        [stateKey]: {
          enumerable: false,
          configurable: false,
          get(this: typeof service) {
            return state[identifier];
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
      [storeKey]: {
        configurable: false,
        enumerable: false,
        get() {
          return store;
        },
      },
    });
    Object.defineProperties(service, descriptors);
    makeObservable(service, {
      ...(service[computedKey] ?? {}),
      ...(service[observableKey] ?? {}),
      ...(service[actionKey] ?? {}),
    });
    if (service[stateKey]) {
      runInAction(() => {
        for (const key in initialValue) {
          service[key] = initialValue[key];
        }
      });
    }
    if (autoRunComputed && service[computedKey]) {
      for (const key in service[computedKey]) {
        autorun(() => service[key]);
      }
    }
    if (Array.isArray(service[subscriptionsKey])) {
      Array.prototype.push.apply(subscriptions, service[subscriptionsKey]);
    }
  });
  if (options.strict) {
    Object.freeze(state);
  }
  for (const subscribe of subscriptions) {
    subscribe();
  }
  return store;
};
