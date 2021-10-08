import { action, observable, computed } from 'mobx';
import {
  identifierKey,
  stateKey,
  actionKey,
  computedKey,
  observableKey,
  storeKey,
  subscriptionsKey,
  bootstrappedKey,
  usm,
} from './constant';

export interface Config {
  autoRunComputed?: boolean;
}

export interface PropertyDescriptor<T> extends TypedPropertyDescriptor<T> {
  initializer(): T;
}

export interface Service<T extends Record<string, any> = Record<string, any>> {
  name?: string;
  readonly [actionKey]: Record<string | symbol, typeof action>;
  readonly [computedKey]: Record<string | symbol, typeof computed>;
  readonly [observableKey]: Record<string | symbol, typeof observable>;
  readonly [bootstrappedKey]: boolean;
  readonly [identifierKey]: string;
  readonly [stateKey]: T;
  readonly [storeKey]: Store<T>;
  readonly [subscriptionsKey]: Subscription[];
  [K: string]: any;
}

export interface StoreOptions {
  modules: any[];
  strict?: boolean;
}

export type Unsubscribe = () => void;
export type Subscription = () => void;

export interface Action<T = Record<string, any>> {
  type: string;
  method: string | symbol;
  params: any[];
  _changeState(...args: any[]): void;
  _usm: typeof usm;
}

export interface Store<T = Record<string, any>> {
  dispatch(action: Action): void;
  getState(): T;
  subscribe(listener: Subscription): Unsubscribe;
}

export type Subscribe = (module: any, listener: () => void) => Unsubscribe;

export type Watch = <P extends boolean, T extends P extends true ? any[] : any>(
  module: any,
  selector: () => P extends true ? [...T] : T,
  watcher: (newValue: T, oldValue: T) => void,
  options?: {
    multiple?: P;
    isEqual?: (x: unknown, y: unknown) => boolean;
  }
) => Unsubscribe;
