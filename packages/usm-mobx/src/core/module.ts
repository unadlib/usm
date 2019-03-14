import BaseModule, { PropertyKey, ActionTypes, Action, State, Reducer } from 'usm';
import { autorun } from 'mobx';

export type ModuleInstance = InstanceType<typeof Module>;

type Store = {
  subscribe(...args:any[]): any,
  getState(): any
};

export default class Module extends BaseModule {
  public get store(): Store {
    return {
      subscribe: autorun,
      getState: () => this._state,
    }
  }
}
