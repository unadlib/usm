import { observable, action as mobxAction, computed as mobxComputed } from 'mobx';
import { event, Event } from 'usm';
import Module, { ModuleInstance } from './core/module';

type Selector = () => any;

interface ComputedFactory {
  (target: ModuleInstance, name: string, descriptor?: Descriptor<any>): any;
}
interface Descriptor<T> extends TypedPropertyDescriptor<T> {
  initializer?(): T;
}

function action(target: ModuleInstance, name: string, descriptor: TypedPropertyDescriptor<any>) {
  const fn = descriptor.value;
  descriptor.value = function (...args:[]) {
    return fn(...args, this);
  }
  return mobxAction(target, name, descriptor);
}

function state(target: ModuleInstance, name: string, descriptor?: TypedPropertyDescriptor<any>) {
  target._stateKeys = target._stateKeys || [];
  target._stateKeys.push(name);
  return observable(target, name, descriptor);
}

function setComputed(target: ModuleInstance, name: string, descriptor?: Descriptor<any>) {
  if (descriptor && typeof descriptor.initializer !== 'function') {
    return mobxComputed(target, name, descriptor);
  }
  const _descriptor = {
    enumerable: true,
    configurable: true,
    get() {
      if (descriptor && typeof descriptor.initializer === 'function') {
        const selectors = descriptor.initializer.call(this);
        const states = selectors.slice(0,-1).map((selector:Selector) => selector());
        return selectors.slice(-1)[0](...states);
      }
      return;
    }
  };
  return mobxComputed(target, name, _descriptor);
}

const computed: ComputedFactory = setComputed;

export {
  Module as default,
  action,
  state,
  computed,
  event,
  Event,
}