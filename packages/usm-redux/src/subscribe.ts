import {
  Subscribe,
  Watch,
  Unsubscribe,
  Subscription,
  Service,
} from './interface';
import { storeKey, subscriptionsKey } from './constant';
import { isEqual } from './utils/index';

const subscribe: Subscribe = (module, listener) => {
  if (typeof module !== 'object') {
    throw new Error(`The subscription target '${module}' is not an object.`);
  }
  const service: Service = module;
  const className = Object.getPrototypeOf(service).constructor.name;
  if (typeof listener !== 'function') {
    throw new Error(
      `The 'listener' should be a function in the class '${className}'.`
    );
  }
  let unsubscribe: Unsubscribe;
  if (service[storeKey]) {
    unsubscribe = service[storeKey].subscribe(listener);
  } else {
    // When constructing
    const subscriptions: Subscription[] = service[subscriptionsKey] || [];
    let _unsubscribe: Unsubscribe;
    subscriptions.push(() => {
      if (typeof service[storeKey] !== 'object') {
        throw new Error(
          `The subscription target class '${className}' should be created via 'createStore()'.`
        );
      }
      _unsubscribe = service[storeKey].subscribe(listener);
    });
    unsubscribe = () => _unsubscribe();
    Object.assign(service, {
      [subscriptionsKey]: subscriptions,
    });
  }
  return unsubscribe;
};

const watch: Watch = (module, selector, watcher) => {
  if (typeof watcher !== 'function') {
    const className = Object.getPrototypeOf(module).constructor.name;
    throw new Error(
      `The 'watcher' should be a function in the class '${className}'.`
    );
  }
  let oldValue = selector();
  return subscribe(module, () => {
    const newValue = selector();
    if (!isEqual(newValue, oldValue)) {
      const lastValue = oldValue;
      oldValue = newValue;
      watcher(newValue, lastValue);
    }
  });
};

export { subscribe, watch };
