import Module, { VuexModule } from './core';

type ModuleInstance = InstanceType<typeof Module> & VuexModule;

interface Descriptor<T> extends TypedPropertyDescriptor<T> {
  initializer(): T;
}

interface StateFactory {
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
  };//
  target._actionTypes = target._actionTypes || [];
  target._actionTypes.push(name);
  descriptor.value = function (this: ModuleInstance, ...args:[]) {
    // @ts-ignore
    return this.store.commit(this.actionTypes[name], ...args);
  }
  return descriptor;
}

const state: StateFactory = createState;

export {
  Module as default,
  state,
  action
}