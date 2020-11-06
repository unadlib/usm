import type { Store as StoreWithVuex } from 'vuex';
import {
  stateKey,
  storeKey,
  subscriptionsKey,
  identifierKey,
  bootstrappedKey,
  actionKey,
  actionsKey,
  gettersKey
} from './constant';

export interface StoreOptions {
  modules: Service[];
  strict?: boolean;
}

export type Store<T = Record<string, any>> = {
  dispatch(action: Action<T>): void;
  getState(): T;
} & StoreWithVuex<T>;

export interface Service<T extends Record<string, any> = Record<string, any>> {
  name?: string;
  readonly [identifierKey]?: string;
  readonly [bootstrappedKey]?: boolean;
  readonly [stateKey]?: T;
  readonly [storeKey]?: Store<T>;
  readonly [subscriptionsKey]?: Subscription[];
  readonly [gettersKey]?: Record<string, () => any>;
  readonly [actionsKey]?: Record<string, (...args: any) => void>;
  [K: string]: any;
}

export type Subscription = () => void;
export type Unsubscribe = () => void;

export interface PropertyDescriptor<T> extends TypedPropertyDescriptor<T> {
  initializer(): T;
}

export interface Action<T = Record<string, any>> {
  type: string;
  method: string;
  params: any[];
  _state: T;
  _usm: typeof actionKey;
}

