import { Patch } from 'mutative';
import { ReducersMapObject, Reducer, StoreEnhancer } from 'redux';
import {
  stateKey,
  storeKey,
  subscriptionsKey,
  bootstrappedKey,
  usm,
  identifierKey,
  strictKey,
  enablePatchesKey,
} from './constant';

export interface Config {
  enablePatches?: boolean;
  reduxEnhancer?: StoreEnhancer<any, any>;
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
  readonly [strictKey]: boolean;
  readonly [enablePatchesKey]: boolean;
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

export type Watch = <P extends boolean, T extends P extends true ? any[] : any>(
  module: any,
  selector: () => P extends true ? readonly [...T] | [...T] : T,
  watcher: (newValue: T, oldValue: T) => void,
  options?: {
    multiple?: P;
    isEqual?: (x: unknown, y: unknown) => boolean;
  }
) => Unsubscribe;
