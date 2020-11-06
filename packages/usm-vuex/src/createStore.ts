import { createStore as createStoreWithVuex, Module } from 'vuex';
import {
  identifierKey,
  stateKey,
  storeKey,
  bootstrappedKey,
  gettersKey,
  actionsKey,
} from './constant';
import { Action, Store, StoreOptions } from './interface';

export const createStore = (options: StoreOptions) => {
  if (typeof options !== 'object' || !Array.isArray(options.modules)) {
    throw new Error(
      `'createStore' options should be a object with a property 'modules'`
    );
  }
  const strict = options.strict ?? __DEV__;
  const identifiers = new Set<string>();
  let store: Store;
  const modules: Record<string, Module<any, any>> = {};
  options.modules.forEach((module, index) => {
    const className = Object.getPrototypeOf(module).constructor.name;
    if (module[bootstrappedKey]) {
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
    if (module[stateKey]) {
      for (const key in module[stateKey]) {
        modules[identifier].state[key] = module[key];
        Object.assign(descriptors, {
          [key]: {
            enumerable: true,
            configurable: false,
            get(this: typeof module) {
              return this[storeKey]!.state[identifier!]![key];
            },
          },
        });
      }

      Object.assign(descriptors, {
        [stateKey]: {
          enumerable: false,
          configurable: false,
          get(this: typeof module) {
            return this[storeKey]!.state[identifier!];
          },
        },
      });
    }
    if (module[gettersKey]) {
      for (const key in module[gettersKey]) {
        modules[identifier].getters![key] = module[gettersKey]![key].bind(
          module
        );
      }
    }
    if (module[actionsKey]) {
      for (const key in module[actionsKey]) {
        modules[identifier].mutations![key] = module[actionsKey]![key].bind(
          module
        );
      }
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
  store = Object.assign(
    createStoreWithVuex<Record<string, any>>({
      modules,
      strict,
    }),
    {
      dispatch: (action: Action) => {
        const name = `${action.type}/${action.method}`;
        store.commit(name, ...action.params);
      },
      getState: () => store.state,
    }
  );
  return store;
};
