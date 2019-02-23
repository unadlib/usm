import { observable, action as mobxAction } from 'mobx';
import Module, { ModuleInstance } from './core/module';

function action(target: ModuleInstance, name: string, descriptor: TypedPropertyDescriptor<any>) {
  const fn = descriptor.value;
  descriptor.value = function (...args:[]) {
    return fn(...args, this);
  }
  return mobxAction(target, name, descriptor);
}

function state(target: ModuleInstance, name: string, descriptor?: TypedPropertyDescriptor<any>) {
  target._state = target._state || {};
  Object.defineProperties(target._state, {
    [name]: {
      configurable: true,
      enumerable: true,
      get() {
        return target[name];
      }
    }
  })
  return observable(target, name, descriptor);
}

export {
  Module as default,
  action,
  state
}