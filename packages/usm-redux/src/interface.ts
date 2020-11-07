import { Patch } from 'immer';
import {
  stateKey,
  storeKey,
  subscriptionsKey,
  bootstrappedKey,
  actionKey,
  identifierKey
} from './constant';

export interface StoreOptions {
  modules: Service[];
  strict?: boolean;
  enablePatches?: boolean;
}

export interface Service<T extends Record<string, any> = Record<string, any>> {
  name?: string;
  readonly [bootstrappedKey]?: boolean;
  readonly [identifierKey]?: string;
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
  dispatch(action: Action): void;
  getState(): T;
  subscribe(listener: Subscription): Unsubscribe;
}

export type Subscribe = (
  service: Service,
  listener: () => void
) => Unsubscribe;

export type Watch = <T>(
  service: Service,
  selector: () => T,
  watcher: (newValue: T, oldValue: T) => void
) => Unsubscribe;
