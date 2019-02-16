import Module from './core';

type ModuleInstance = InstanceType<typeof Module>;

function state(target: ModuleInstance, name: string, descriptor?: TypedPropertyDescriptor<any>) {
  target._state = target._state || {};
  target._state[name] = descriptor.initializer.call(target);
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
    return this.store.commit(this.actionTypes[name], ...args);
  }
  return descriptor;
}


export {
  Module as default,
  state,
  action
}