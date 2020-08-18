import { stateKey, storeKey, subscriptionsKey } from './constant';

export interface Store<T> {
  getState(): T;
}

export interface Service<T extends Record<string, any> = Record<string, any>> {
  readonly [stateKey]?: T;
  readonly [storeKey]?: Store<T>;
  readonly [subscriptionsKey]?: Subscriptions;
}

export interface Subscriptions {

}
