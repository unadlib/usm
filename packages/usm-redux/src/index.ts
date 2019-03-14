import produce from 'immer';
import { createSelector } from 'reselect';
import { event, Event } from 'usm';
import Module, { ModuleInstance } from './core/module';

type Selector = () => any;

type Compute = () => any;
interface ComputedFactory {
  (target: ModuleInstance, name: string, descriptor?: Descriptor<any>): any;
}
interface StateFactory {
  (target: ModuleInstance, name: string, descriptor?: Descriptor<any>): any;
}
interface Descriptor<T> extends TypedPropertyDescriptor<T> {
  initializer(): T;
}

function createState(target: ModuleInstance, name: string, descriptor?: Descriptor<any>) {
  target._actionTypes = target._actionTypes || [];
  target._actionTypes.push(name);
  target._reducersMaps = target._reducersMaps || {};
  target._reducersMaps[name] = (types, initialValue = descriptor ? descriptor.initializer.call(target) : undefined) =>
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

function action(target: ModuleInstance, name: string, descriptor: TypedPropertyDescriptor<any>) {
  const fn = descriptor.value;
  descriptor.value = function (this: ModuleInstance, ...args:[]) {
    const states = produce(this.state, fn.bind(this, ...args));
    this._dispatch({
      type: Object.keys(this.state).map(key => this.actionTypes[key]),
      states,
    });
  };
  return descriptor;
}

const WRAPPER = '__seletors__';

function setComputed(target: ModuleInstance, name: string, descriptor?: Descriptor<any>) {
  return {
    configurable: true,
    enumerable: true,
    get<T extends ModuleInstance>(this: T) {
      if (!this[WRAPPER]) {
        this[WRAPPER] = {};
      }
      if (!this[WRAPPER][name]) {
        // @ts-ignore
        const selector = createSelector(...descriptor.initializer.call(this));
        this[WRAPPER][name] = () => selector();
      }
      return this[WRAPPER][name]();
    }
  };
}

const state: StateFactory = createState;
const computed: ComputedFactory = setComputed;

export {
  Module as default,
  state,
  action,
  computed,
  event,
  Event,
}