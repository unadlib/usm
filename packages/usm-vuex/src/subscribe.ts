import { Subscribe, Watch, Unsubscribe, Subscription } from './interface';
import { storeKey, subscriptionsKey } from './constant';
import { isEqual } from './utils/index';

const subscribe: Subscribe = (module, listener) => {
  if (typeof listener !== 'function') {
    const className = Object.getPrototypeOf(module).constructor.name;
    throw new Error(`The 'listener' should be a function in the class '${className}'.`);
  }
  let unsubscribe: Unsubscribe;
  if (module[storeKey]) {
    unsubscribe = module[storeKey]?.subscribe(listener)!;
  } else {
    // When constructing
    const subscriptions: Subscription[] = module[subscriptionsKey] || [];
    let _unsubscribe: Unsubscribe;
    subscriptions.push(() => {
      _unsubscribe = module[storeKey]?.subscribe(listener)!;
    });
    unsubscribe = () => _unsubscribe();
    Object.assign(module, {
      [subscriptionsKey]: subscriptions,
    });
  }
  return unsubscribe!;
};

const watch: Watch = (module, selector, watcher) => {
  if (typeof watcher !== 'function') {
    const className = Object.getPrototypeOf(module).constructor.name;
    throw new Error(`The 'watcher' should be a function in the class '${className}'.`);
  }
  let oldValue = selector();
  // !don't use Vuex store's watch function, because it is asynchronous.
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
