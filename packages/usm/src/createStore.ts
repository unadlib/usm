import { StoreOptions, Service, Store } from './interface';
import { EventEmitter } from './utils';
import { changeStateKey } from './constant';

const bootstrap = (module: Service) => {};

export const createStore = (options: StoreOptions) => {
  if (typeof options !== 'object' || !Array.isArray(options.modules)) {
    throw new Error(
      `'createStore' options should be a object with a property 'modules'`
    );
  }
  const eventEmitter = new EventEmitter();
  const state: Record<string, any> = {};
  const store: Store = {
    getState: () => state,
    subscribe: (subscription) => {
      eventEmitter.on(changeStateKey, subscription);
      return () => eventEmitter.off(changeStateKey, subscription);
    },
  };
  options.modules.forEach((module) => {
    bootstrap(module);
  });
  return store;
};
