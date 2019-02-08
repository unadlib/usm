import produce from 'immer';
import { createStore, combineReducers } from 'redux';
import Module from './core/module';

Module.combineReducers = combineReducers;
Module.createStore = createStore;

function state(target, name, descriptor){
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

function action(target, name, descriptor) {
  const fn = descriptor.value;
  descriptor.value = function (...args) {
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