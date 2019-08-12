import { event, Event } from 'usm';
import Module from './core';


type Selector = () => any;
interface Descriptor<T> extends TypedPropertyDescriptor<T> {
  initializer?(): T;
}

interface Factory {
  (target: Module, name: string, descriptor?: Descriptor<any>): any;
}

function createState(target: Module, name: string, descriptor?: Descriptor<any>) {
  target._state = target._state || {};
  target._state[name] = descriptor && descriptor.initializer ? descriptor.initializer.call(target) : undefined;
  const get = function(this: Module) {
    return this.state[name];
  };
  const set = function(this: Module, value: any) {
    if (typeof this._state === 'object') {
      this._state[name] = value;
    }
  };
  return {
    enumerable: true,
    configurable: true,
    get,
    set
  };
}

function action(target: Module, name: string, descriptor: TypedPropertyDescriptor<any>) {
  const fn = descriptor.value;
  target._mutations = target._mutations || {};
  target._mutations[name] = (state: any, args: []) => {
    return fn.call(target, ...args, state);
  };
  target._actionTypes = target._actionTypes || [];
  target._actionTypes.push(name);
  descriptor.value = function (this: Module, ...args:[]) {
    return this.store.commit(this.actionTypes[name], args);
  }
  return descriptor;
}

function setComputed(target: Module, name: string, descriptor?: Descriptor<any>) {
  let that;
  target._getters = target._getters || {};
  target._getters[name] = () => {
    if (descriptor && typeof descriptor.initializer === 'function') {
      const selectors = descriptor.initializer.call(that);
      const states = selectors.slice(0,-1).map((selector: Selector) => selector());
      return selectors.slice(-1)[0](...states);
    }
    if (descriptor && typeof descriptor.get === 'function') {
      return descriptor.get.call(that);
    }
    throw new Error(`${name} must be used in getter or properties setter value with Array type`);
  };
  return {
    enumerable: true,
    configurable: true,
    get(this: Module) {
      that = this;
      return this.store.getters[name];
    }
  };
}

const computed: Factory = setComputed;

const state: Factory = createState;
export {
  Module as default,
  state,
  action,
  computed,
  event,
  Event
}