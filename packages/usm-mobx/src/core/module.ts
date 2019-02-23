import BaseModule, { PropertyKey, ActionTypes, Action, State, Reducer } from 'usm';
import { autorun } from 'mobx';

export type ModuleInstance = InstanceType<typeof Module>;

export default class Module extends BaseModule {
  // @ts-ignore
  public get store() {
    return {
      subscribe: autorun,
      getState: () => this._state,
    }
  }
}
