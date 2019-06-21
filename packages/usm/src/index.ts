import Module, {
  ModuleInstance, 
  Store,
  Action,
  Reducer,
  AnyAction,
  Params,
  Properties,
  InterfaceModule,
  ModulesMap,
} from './core/module';
import event, { Event } from './utils/event';

type Selector = () => any;
interface Descriptor<T> extends TypedPropertyDescriptor<T> {
  initializer(): T;
}

interface ComputedFactory {
  (target: ModuleInstance, name: string, descriptor?: Descriptor<any>): any;
}
interface StateFactory {
  (target: ModuleInstance, name: string, descriptor?: Descriptor<any>): any;
}

function createState(target: ModuleInstance, name: string, descriptor?: Descriptor<any>) {
  target._state = target._state || {};
  target._state[name] = descriptor && descriptor.initializer ? descriptor.initializer.call(target) : undefined;
  const get = function(this: ModuleInstance) {
    return this.state[name];
  };
  const set = function(this: ModuleInstance, value: any) {
    this.state[name] = value;
  };
  return {
    enumerable: true,
    configurable: true,
    get,
    set,
  };
}

function action(target: ModuleInstance, name: string, descriptor: TypedPropertyDescriptor<any>) {
  const fn = descriptor.value;
  descriptor.value = function (this: ModuleInstance, ...args:[]) {
    const result = fn.call(this, ...args, this._state);
    if (event._events.state) {
      event.emit('state', { action: name, module: target.constructor.name });
    }
    return result;
  };
  return descriptor;
}

function setComputed(target: ModuleInstance, name: string, descriptor?: Descriptor<any>) {
  return {
    enumerable: true,
    configurable: true,
    get() {
      if (descriptor && typeof descriptor.initializer === 'function') {
        const selectors = descriptor.initializer.call(this);
        const states = selectors.slice(0,-1).map((selector: Selector) => selector());
        return selectors.slice(-1)[0](...states);
      }
      return;
    }
  };
}

const state: StateFactory = createState;

const computed: ComputedFactory = setComputed;

export {
  Module as default,
  action,
  state,
  computed,
  event,
  Event,
  Store,
  Action,
  Reducer,
  AnyAction,
  Params,
  Properties,
  InterfaceModule,
  ModulesMap
}
