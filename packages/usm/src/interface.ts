import { stateKey, storeKey, subscriptionsKey } from './constant';

export interface StoreOptions {
  modules: Service[];
}

export interface Store<T = any> {
  getState(): T;
  subscribe(subscription: Subscription): Unsubscribe;
}

export interface Service<T extends Record<string, any> = Record<string, any>> {
  readonly [stateKey]?: T;
  readonly [storeKey]?: Store<T>;
  readonly [subscriptionsKey]?: Subscriptions;
}

export type Subscription = () => void;
export type Unsubscribe = () => void;

export type Subscriptions = Subscription[];

export interface PropertyDescriptor<T> extends TypedPropertyDescriptor<T> {
  initializer(): T;
}
