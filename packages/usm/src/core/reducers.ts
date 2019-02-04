import moduleStatuses from './moduleStatuses';
import { Action, ActionTypes } from './module';

export interface Reducer {
  (state: State<any>, action: Action): State<any>;
}
export type State<T> = T;

export function getModuleStatusReducer<T>(types: ActionTypes, initialValue: T): Reducer {
  return (state = initialValue || moduleStatuses.initial, { type }): State<any> => {
    switch (type) {
      case types.init:
        return moduleStatuses.pending;
      case types.reset:
        return moduleStatuses.resetting;
      case types.initSuccess:
        return moduleStatuses.ready;
      default:
        return state;
    }
  };
}
