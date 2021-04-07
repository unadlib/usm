import { Patch } from 'immer';
import { Middleware, ReducersMapObject, Reducer } from 'redux';
import {
  stateKey,
  storeKey,
  subscriptionsKey,
  bootstrappedKey,
  usm,
  identifierKey,
} from './constant';

export interface Config {
  enablePatches?: boolean;
  reduxMiddleware?: Middleware[];
  handleReducers?: (reducers: ReducersMapObject) => Reducer;
}

export interface StoreOptions {
  modules: any[];
  strict?: boolean;
}

export interface Service<T extends Record<string, any> = Record<string, any>> {
  name?: string;
  readonly [bootstrappedKey]: boolean;
  readonly [identifierKey]: string;
  readonly [stateKey]: T;
  readonly [storeKey]: Store<T>;
  readonly [subscriptionsKey]: Subscription[];
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
  _usm: typeof usm;
  _patches?: Patch[];
  _inversePatches?: Patch[];
}

export interface Store<T = Record<string, any>> {
  dispatch(action: Action): void;
  getState(): T;
  subscribe(listener: Subscription): Unsubscribe;
}

export type Subscribe = (module: any, listener: () => void) => Unsubscribe;

export type Watch = <T>(
  module: any,
  selector: () => T,
  watcher: (newValue: T, oldValue: T) => void
) => Unsubscribe;
