import { createPinia, defineStore } from 'pinia';
import {
  identifierKey,
  stateKey,
  storeKey,
  piniaStoreKey,
  bootstrappedKey,
  gettersKey,
  actionsKey,
  subscriptionsKey,
  changeStateKey,
} from './constant';
import type {
  Action,
  Store,
  StoreOptions,
  Subscription,
  Config,
  Service,
} from './interface';
import { EventEmitter } from './utils/index';

export const createStore = (
  options: StoreOptions,
  preloadedState?: Record<string, any>,
  config: Config = {}
) => {
  if (typeof options !== 'object' || !Array.isArray(options.modules)) {
    throw new Error(
      `'createStore' options should be a object with a property 'modules'`
    );
  }
  const pinia = config.pinia ?? createPinia();
  const plugins = config.plugins ?? [];
  plugins.forEach((plugin) => pinia.use(plugin));
  const identifiers = new Set<string>();
  const subscriptions: Subscription[] = [];
  const eventEmitter = new EventEmitter();
  const moduleStores: Record<string, Record<string, any>> = {};
  let isDispatching = false;

  const store = Object.assign(pinia, {
    dispatch: (action: Action) => {
      const moduleStore = moduleStores[action.type];
      if (typeof moduleStore !== 'object') {
        if (__DEV__) {
          console.warn(
            `The action target '${action.type}' can not be dispatched because the module does not exist.`
          );
        }
        return undefined;
      }
      const handler = moduleStore[action.method];
      if (typeof handler !== 'function') {
        if (__DEV__) {
          console.warn(
            `The method '${action.method}' can not be dispatched because it does not exist in module '${action.type}'.`
          );
        }
        return undefined;
      }
      isDispatching = true;
      try {
        return handler.apply(moduleStore, action.params);
      } finally {
        eventEmitter.emit(changeStateKey);
        isDispatching = false;
      }
    },
    getState: () => pinia.state.value as Record<string, any>,
    subscribe: (listener: () => void) => {
      eventEmitter.on(changeStateKey, listener);
      return () => eventEmitter.off(changeStateKey, listener);
    },
  }) as Store;

  options.modules.forEach((module, index) => {
    if (typeof module !== 'object' || module === null) return;
    const service: Service = module;
    const className = Object.getPrototypeOf(service).constructor.name;
    if (service[bootstrappedKey]) {
      if (__DEV__) {
        console.warn(
          `The module with an index of ${index} and a name of ${className} in the module list is a duplicate module.`
        );
      }
    }
    let identifier = service[identifierKey] ?? service.name;
    if (identifier === null || typeof identifier === 'undefined') {
      identifier = `@@usm-pinia/${className}/${Math.random().toString(36)}`;
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

    const stateInitializer: Record<string, any> = {};
    if (service[stateKey]) {
      for (const key in service[stateKey]) {
        stateInitializer[key] = service[key];
        if (
          preloadedState &&
          preloadedState[identifier] &&
          Object.prototype.hasOwnProperty.call(preloadedState[identifier], key)
        ) {
          stateInitializer[key] = preloadedState[identifier][key];
        }
      }
    }

    const gettersDef: Record<string, () => any> = {};
    if (service[gettersKey]) {
      for (const key in service[gettersKey]) {
        gettersDef[key] = service[gettersKey][key].bind(service);
      }
    }

    const actionsDef: Record<string, (...args: any[]) => any> = {};
    if (service[actionsKey]) {
      for (const key in service[actionsKey]) {
        actionsDef[key] = (...args: any[]) =>
          service[actionsKey][key].apply(service, args);
      }
    }

    const usePiniaStore = defineStore(identifier, {
      state: () => ({ ...stateInitializer }),
      getters: gettersDef,
      actions: actionsDef,
    });

    const piniaStore = usePiniaStore(pinia);
    moduleStores[identifier] = piniaStore as Record<string, any>;

    if (service[stateKey]) {
      for (const key in service[stateKey]) {
        Object.assign(descriptors, {
          [key]: {
            enumerable: true,
            configurable: false,
            get(this: typeof service) {
              return (piniaStore as Record<string, any>)[key];
            },
            set(this: typeof service, value: unknown) {
              (piniaStore as Record<string, any>)[key] = value;
            },
          },
        });
      }
      Object.assign(descriptors, {
        [stateKey]: {
          enumerable: false,
          configurable: false,
          get() {
            return piniaStore.$state;
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
      [piniaStoreKey]: {
        configurable: false,
        enumerable: false,
        value: piniaStore,
      },
    });

    Object.defineProperties(service, descriptors);

    piniaStore.$subscribe(
      () => {
        if (!isDispatching) {
          eventEmitter.emit(changeStateKey);
        }
      },
      { detached: true }
    );

    if (Array.isArray(service[subscriptionsKey])) {
      Array.prototype.push.apply(subscriptions, service[subscriptionsKey]);
    }
  });

  for (const subscribe of subscriptions) {
    subscribe();
  }

  return store;
};
