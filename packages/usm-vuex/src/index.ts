import { event, Event } from 'usm';
import Module, { VuexModule } from './core';

type ModuleInstance = InstanceType<typeof Module> & VuexModule;

type Selector = () => any;
interface Descriptor<T> extends TypedPropertyDescriptor<T> {
  initializer(): T;
}

interface Factory {
  (target: ModuleInstance, name: string, descriptor?: Descriptor<any>): any;
}

function createState(target: ModuleInstance, name: string, descriptor?: Descriptor<any>) {
  target._state = target._state || {};
  target._state[name] = descriptor ? descriptor.initializer.call(target) : undefined;
  const get = function(this: ModuleInstance) {
    return this.state[name];
  };
  return {
    enumerable: true,
    configurable: true,
    get
  };
}

function action(target: ModuleInstance, name: string, descriptor: TypedPropertyDescriptor<any>) {
  const fn = descriptor.value;
  target._mutations = target._mutations || {};
  target._mutations[name] = (...args: []) => {
    const state = args.shift();
    return fn.call(target, ...args, state);
  };
  target._actionTypes = target._actionTypes || [];
  target._actionTypes.push(name);
  descriptor.value = function (this: ModuleInstance, ...args:[]) {
    return this.store.commit(this.actionTypes[name], ...args);
  }
  return descriptor;
}

function setComputed(target: ModuleInstance, name: string, descriptor?: Descriptor<any>) {
  target._getters = target._getters || {};
  target._getters[name] = () => {
    if (descriptor && typeof descriptor.initializer === 'function') {
      const selectors = descriptor.initializer.call(target);
      const states = selectors.slice(0,-1).map((selector: Selector) => selector());
      return selectors.slice(-1)[0](...states);
    }
    return;
  };
  return {
    enumerable: true,
    configurable: true,
    get(this: ModuleInstance) {
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