import { Patch } from 'immer';
import {
  stateKey,
  storeKey,
  subscriptionsKey,
  bootstrappedKey,
  actionKey,
} from './constant';
import { Store } from 'redux';

export interface StoreOptions {
  modules: Service[];
  strict?: boolean;
  enablePatches?: boolean;
}

export interface Service<T extends Record<string, any> = Record<string, any>> {
  name?: string;
  readonly [bootstrappedKey]?: boolean;
  readonly [stateKey]?: T;
  readonly [storeKey]?: Store<T>;
  readonly [subscriptionsKey]?: Subscriptions;
  [K: string]: any;
}

export type Subscription = () => void;

export type Subscriptions = Subscription[];

export interface PropertyDescriptor<T> extends TypedPropertyDescriptor<T> {
  initializer(): T;
}

export interface Action<T = Record<string, any>> {
  state: T;
  lastState: T;
  type: string;
  method: string | symbol;
  _usm: typeof actionKey;
  _patches?: Patch[];
  _inversePatches?: Patch[];
}
