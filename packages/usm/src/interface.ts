import {
  stateKey,
  storeKey,
  subscriptionsKey,
  identifierKey,
  bootstrappedKey,
  actionKey
} from './constant';

export interface StoreOptions {
  modules: Service[];
  strict?: boolean;
}

export interface Store<T = any> {
  dispatch(action: Action<T>): void;
  getState(): T;
  subscribe(subscription: Subscription): Unsubscribe;
}

export interface Service<T extends Record<string, any> = Record<string, any>> {
  name?: string;
  readonly [identifierKey]?: string;
  readonly [bootstrappedKey]?: boolean;
  readonly [stateKey]?: T;
  readonly [storeKey]?: Store<T>;
  readonly [subscriptionsKey]?: Subscriptions;
  [K: string]: any;
}

export type Subscription = () => void;
export type Unsubscribe = () => void;

export type Subscriptions = Subscription[];

export interface PropertyDescriptor<T> extends TypedPropertyDescriptor<T> {
  initializer(): T;
}

export interface Action<T = Record<string, any>> {
  type: string;
  method: string | symbol;
  params: any[];
  _state: T;
  _usm: typeof actionKey;
}

