import produce from 'immer';
import { ActionTypes } from 'usm';
import Module, { ModuleInstance, Dispatch } from './core/module';

type Properties<T = any> = {
  [P in string]?: T;
}

type Descriptor<T> = {
  value: T;
  get?(): T;
  set?(): void;
  configurable: boolean;
  enumerable: boolean;
  writable: boolean;
  state: Properties;
  _dispatch: Dispatch;
  actionTypes: ActionTypes;
};

interface func {
  (...args:[]): any;
}

function state(target: ModuleInstance, name: string, descriptor: any){
  target._actionTypes = target._actionTypes || [];
  target._actionTypes.push(name);
  target._reducersMaps = target._reducersMaps || {};
  target._reducersMaps[name] = (types, initialValue = descriptor.initializer.call(target)) =>
  (_state = initialValue, { type, states }) => type.indexOf(types[name]) > -1 && states ? states[name] : _state;
  const get = function(this: ModuleInstance) {
    return this.state[name];
  };
  return {
    enumerable: true,
    configurable: true,
    get
  };
}

function action(target: ModuleInstance, name: string, descriptor: Descriptor<func>) {
  const fn = descriptor.value;
  descriptor.value = function (...args:[]) {
    const states = produce(this.state, fn.bind(this, ...args));
    this._dispatch({
      type: Object.keys(this.state).map(key => this.actionTypes[key]),
      states,
    });
  };
  return descriptor;
}

export {
  Module as default,
  state,
  action
}