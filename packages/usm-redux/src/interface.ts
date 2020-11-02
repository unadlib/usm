import { Patch } from 'immer';
import {
  stateKey,
  storeKey,
  subscriptionsKey,
  bootstrappedKey,
  actionKey,
} from './constant';

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
  readonly [subscriptionsKey]?: Subscription[];
  [K: string]: any;
}

export type Unsubscribe = () => void;

export type Subscription = () => void;

export interface PropertyDescriptor<T> extends TypedPropertyDescriptor<T> {
  initializer(): T;
}

export interface Action<T = Record<string, any>> {
  type: string;
  method: string | symbol;
  params: any[];
  _state: T;
  _usm: typeof actionKey;
  _patches?: Patch[];
  _inversePatches?: Patch[];
}

export interface Store<T = Record<string, any>> {
  dispatch<P = Action>(action: P): void;
  getState(): T;
  subscribe(listener: Subscription): Unsubscribe;
}
