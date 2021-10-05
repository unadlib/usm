import type { Store as StoreWithVuex, Plugin } from 'vuex';
import {
  stateKey,
  storeKey,
  subscriptionsKey,
  identifierKey,
  bootstrappedKey,
  usm,
  actionsKey,
  gettersKey,
} from './constant';

export interface Config {
  plugins?: Plugin<Record<string, any>>[];
  devtools?: boolean;
}

export interface StoreOptions {
  modules: any[];
  strict?: boolean;
}

export type Store<T = Record<string, any>> = {
  dispatch(action: Action<T>): void;
  getState(): T;
} & StoreWithVuex<T>;

export interface Service<T extends Record<string, any> = Record<string, any>> {
  name?: string;
  readonly [identifierKey]: string;
  readonly [bootstrappedKey]: boolean;
  readonly [stateKey]: T;
  readonly [storeKey]: Store<T>;
  readonly [subscriptionsKey]: Subscription[];
  readonly [gettersKey]: Record<string, () => any>;
  readonly [actionsKey]: Record<string, (...args: any) => void>;
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
  _usm: typeof usm;
}

export type Subscribe = (module: any, listener: () => void) => Unsubscribe;

export type Watch = <P extends boolean, T extends P extends true ? any[] : any>(
  module: any,
  selector: () => P extends true ? [...T] : T,
  watcher: (newValue: T, oldValue: T) => void,
  options?: {
    multiple?: P;
  }
) => Unsubscribe;
