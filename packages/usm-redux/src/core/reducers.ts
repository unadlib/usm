import { ActionTypes, Reducer, State, moduleStatuses } from 'usm';

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
