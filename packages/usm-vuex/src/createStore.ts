import { createStore as createStoreWithVuex, Module } from 'vuex';
import {
  identifierKey,
  stateKey,
  storeKey,
  bootstrappedKey,
  gettersKey,
  actionsKey,
  subscriptionsKey,
} from './constant';
import {
  Action,
  Store,
  StoreOptions,
  Subscription,
  Config,
  Service,
} from './interface';

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
  const strict = options.strict ?? __DEV__;
  const devtools = config.devtools ?? __DEV__;
  const plugins = config.plugins ?? [];
  const identifiers = new Set<string>();
  let store: Store;
  const subscriptions: Subscription[] = [];
  const modules: Record<string, Module<any, any>> = {};
  options.modules.forEach((module, index) => {
    if (typeof module !== 'object' || module === null) return;
    const service: Service = module;
    const className = Object.getPrototypeOf(service).constructor.name;
    if (service[bootstrappedKey]) {
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
      identifier = `@@usm-vuex/${className}/${Math.random().toString(36)}`;
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
    modules[identifier] = {
      namespaced: true,
      state: {},
      getters: {},
      mutations: {},
    };
    if (service[stateKey]) {
      for (const key in service[stateKey]) {
        modules[identifier].state[key] = service[key];
        if (
          preloadedState &&
          preloadedState[identifier] &&
          Object.hasOwnProperty.call(preloadedState[identifier], key)
        ) {
          modules[identifier].state[key] = preloadedState[identifier][key];
        }
        Object.assign(descriptors, {
          [key]: {
            enumerable: true,
            configurable: false,
            get(this: typeof service) {
              return this[storeKey].state[identifier][key];
            },
            set(this: typeof service, value: unknown) {
              this[storeKey].state[identifier][key] = value;
            },
          },
        });
      }

      Object.assign(descriptors, {
        [stateKey]: {
          enumerable: false,
          configurable: false,
          get(this: typeof service) {
            return this[storeKey].state[identifier];
          },
        },
      });
    }
    if (service[gettersKey]) {
      for (const key in service[gettersKey]) {
        modules[identifier].getters![key] = service[gettersKey][key].bind(
          service
        );
      }
    }
    if (service[actionsKey]) {
      for (const key in service[actionsKey]) {
        modules[identifier].mutations![key] = service[actionsKey][key].bind(
          service
        );
      }
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
    if (Array.isArray(service[subscriptionsKey])) {
      Array.prototype.push.apply(subscriptions, service[subscriptionsKey]);
    }
  });
  store = Object.assign(
    createStoreWithVuex<Record<string, any>>({
      modules,
      strict,
      plugins,
      devtools,
    }),
    {
      dispatch: (action: Action) => {
        const name = `${action.type}/${action.method}`;
        store.commit(name, ...action.params);
      },
      getState: () => store.state,
    }
  );
  for (const subscribe of subscriptions) {
    subscribe();
  }
  return store;
};
