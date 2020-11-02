import { action, observable, computed } from 'mobx';
import {
  identifierKey,
  stateKey,
  actionKey,
  computedKey,
  observableKey,
  storeKey,
  subscriptionsKey,
  bootstrappedKey
} from './constant';

export interface PropertyDescriptor<T> extends TypedPropertyDescriptor<T> {
  initializer(): T;
}

export interface Service<T extends Record<string, any> = Record<string, any>> {
  name?: string;
  readonly [actionKey]?: Record<string | symbol, typeof action>;
  readonly [computedKey]?: Record<string | symbol, typeof computed>;
  readonly [observableKey]?: Record<string | symbol, typeof observable>;
  readonly [bootstrappedKey]?: boolean;
  readonly [identifierKey]?: string;
  readonly [stateKey]?: T;
  readonly [storeKey]?: Store<T>;
  readonly [subscriptionsKey]?: Subscriptions;
  [K: string]: any;
}

export interface StoreOptions {
  modules: Service[];
  strict?: boolean;
}

export type Subscriptions = Subscription[];

export type Subscription = (subscription: () => void) => Unsubscribe;

export interface Action<T = Record<string, any>> {
  type: string;
  method: string | symbol;
  params: any[];
  _changeState(...args: any[]): void;
}

export type Unsubscribe = () => void;

export interface Store<T = Record<string, any>> {
  dispatch(action: Action): void;
  getState(): T;
  subscribe: Subscription;
}
