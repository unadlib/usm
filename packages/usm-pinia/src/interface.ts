import type {
  Pinia,
  PiniaPlugin,
  StateTree,
  StoreGeneric,
} from 'pinia';
import {
  storeKey,
  stateKey,
  subscriptionsKey,
  identifierKey,
  bootstrappedKey,
  gettersKey,
  actionsKey,
  piniaStoreKey,
  usm,
} from './constant';

export interface Config {
  pinia?: Pinia;
  plugins?: PiniaPlugin[];
}

export interface StoreOptions {
  modules: any[];
  strict?: boolean;
}

export type Store<T extends StateTree = Record<string, any>> = Pinia & {
  dispatch(action: Action<T>): any;
  getState(): T;
  subscribe(listener: () => void): Unsubscribe;
};

export interface Service<T extends Record<string, any> = Record<string, any>> {
  name?: string;
  readonly [identifierKey]: string;
  readonly [bootstrappedKey]: boolean;
  readonly [stateKey]: T;
  readonly [storeKey]: Store<T>;
  readonly [subscriptionsKey]: Subscription[];
  readonly [gettersKey]: Record<string, () => any>;
  readonly [actionsKey]: Record<string, (...args: any) => any>;
  readonly [piniaStoreKey]: StoreGeneric;
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
  selector: () => P extends true ? readonly [...T] | [...T] : T,
  watcher: (newValue: T, oldValue: T) => void,
  options?: {
    multiple?: P;
    isEqual?: (x: unknown, y: unknown) => boolean;
  }
) => Unsubscribe;
