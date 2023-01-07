import type { Patch } from 'mutative';
import {
  stateKey,
  storeKey,
  subscriptionsKey,
  identifierKey,
  bootstrappedKey,
  usm,
  enableAutoFreezeKey,
  enablePatchesKey,
} from './constant';

export interface Config {
  enablePatches?: boolean;
  hook?(store: Store, action: Action): Action;
}

export interface StoreOptions {
  modules: any[];
  strict?: boolean;
}

export interface Store<T = Record<string, any>> {
  dispatch(action: Action<T>): void;
  getState(): T;
  subscribe(listener: Subscription): Unsubscribe;
}

export interface Service<T extends Record<string, any> = Record<string, any>> {
  name?: string;
  readonly [identifierKey]: string;
  readonly [enableAutoFreezeKey]: boolean;
  readonly [enablePatchesKey]: boolean;
  readonly [bootstrappedKey]: boolean;
  readonly [stateKey]: T;
  readonly [storeKey]: Store<T>;
  readonly [subscriptionsKey]: Subscription[];
  [K: string]: any;
}

export type Subscription = () => void;
export type Unsubscribe = () => void;

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
