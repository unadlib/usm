import { createStore as createStoreWithVuex, Module } from 'vuex';
import {
  changeStateKey,
  identifierKey,
  stateKey,
  storeKey,
  bootstrappedKey,
} from './constant';
import { Action, Store, StoreOptions } from './interface';

export const createStore = (options: StoreOptions) => {
  if (typeof options !== 'object' || !Array.isArray(options.modules)) {
    throw new Error(
      `'createStore' options should be a object with a property 'modules'`
    );
  }
  const strict = options.strict ?? false;
  let store: Store;
  const modules: Record<string, Module<any, any>> = {};
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
      identifier = `@@usm/${className}/${Math.random().toString(36)}`;
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
    if (typeof modules[identifier] !== 'undefined') {
      identifier += `${index}`;
    }
    const descriptors: Record<string, PropertyDescriptor> = {
      [bootstrappedKey]: {
        enumerable: false,
        configurable: false,
        value: true,
      },
    };
    //
  });
  const storeWithVuex = createStoreWithVuex<Record<string, any>>({
    modules,
    strict,
  });
  store = {
    dispatch: (action: Action) => {
      //
    },
    getState: () => storeWithVuex.state,
    subscribe: (subscription) => {
      return storeWithVuex.subscribe(subscription);
    },
  }
  return store;
};
