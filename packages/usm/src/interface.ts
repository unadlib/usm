import {
  stateKey,
  storeKey,
  subscriptionsKey,
  identifierKey,
} from './constant';

export interface StoreOptions {
  modules: Service[];
  devOptions?: DevOptions;
}

export interface DevOptions {
  autoFreeze?: boolean;
}

export interface Store<T = any> {
  dispatch(action: Action<T>): void;
  getState(): T;
  subscribe(subscription: Subscription): Unsubscribe;
}

export interface Service<T extends Record<string, any> = Record<string, any>> {
  [identifierKey]?: string;
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

export interface Action<T = Record<string, any>> {
  state: T;
  lastState: T;
  type: string;
  method: string | symbol;
}
