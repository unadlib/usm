import produce from 'immer';
import Module, { ModuleInstance } from './core/module';

function state(target, name: string, descriptor: any){
  target._actionTypes = target._actionTypes || [];
  target._actionTypes.push(name);
  target._reducersMaps = target._reducersMaps || {};
  target._reducersMaps[name] = (actionTypes) => (
    (types, initialValue) =>
    (_state = initialValue, { type, states }) => type.indexOf(types[name]) > -1 ? states[name] : _state
  )(actionTypes, descriptor.initializer.call(this))
  return {
    enumerable: true,
    configurable: true,
    get: function() {
        return this.state[name];
    }
  };
}

type Descriptor<T> = {
  value?: T;
  get?(): T;
  set?(): void;
  configurable: boolean;
  enumerable: boolean;
  writable: boolean;
}

function action(target, name: string, descriptor: any) {
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