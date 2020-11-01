import { configure } from 'mobx';
import { EventEmitter } from './utils';
import { changeStateKey } from './constant';
import type { StoreOptions, Store, Action } from './interface';

export const createStore = (options: StoreOptions) => {
  configure({
    enforceActions: "always",
    computedRequiresReaction: false,
    reactionRequiresObservable: options.strict,
    observableRequiresReaction: options.strict,
    disableErrorBoundaries: !options.strict
  });
  let state: Record<string, any> = {};
  const eventEmitter = new EventEmitter();
  const store: Store = {
    dispatch: (action: Action) => {
      action._changeState();
      eventEmitter.emit(changeStateKey);
    },
    getState: () => state,
    subscribe: (subscription) => {
      eventEmitter.on(changeStateKey, subscription);
      return () => eventEmitter.off(changeStateKey, subscription);
    },
  };
  return store;
};
