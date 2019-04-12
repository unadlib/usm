import BaseModule, { PropertyKey, ActionTypes, Action, State, Reducer } from 'usm';
import { autorun } from 'mobx';

export type ModuleInstance = InstanceType<typeof Module>;

type Store = {
  subscribe(...args:any[]): any,
  getState(): any
};

export default class Module extends BaseModule {
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
