import BaseModule, { Store }from 'usm';
import { autorun } from 'mobx';

interface Module {
  _stateKeys: string[];
  [K: string]: any;
}
class Module<T = {}> extends BaseModule<T> {
  public get _state() {
    return (this._stateKeys || []).reduce((state: any, key: string) => Object.assign(state, {
      [key]: this[key],
    }), {});
  }

  public get store(): Store {
    return {
      subscribe: autorun,
      getState: () => this._state,
    }
  }
}

export {
  Module as default,
}
