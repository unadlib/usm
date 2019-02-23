import Module, { ModuleInstance } from './core/module';

interface Descriptor<T> extends TypedPropertyDescriptor<T> {
  initializer(): T;
}

interface StateFactory {
  (target: ModuleInstance, name: string, descriptor?: Descriptor<any>): any;
}

// It just supports running TypeScript with Babel 7+.
// Because there are different decorators in TypeScript ECMAScript.
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
  descriptor.value = function (this: ModuleInstance, ...args:[]) {
    const result = fn.call(this, ...args, this._state);
    return result;
  };
  return descriptor;
}

const state: StateFactory = createState;

export {
  Module as default,
  action,
  state
}