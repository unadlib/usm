import Module, { Action, ActionTypes, Reducer, State, StaticModule, Properties } from './src/core/module';
import { state, action } from './src';
import Enum, { PropertyKey } from './src/utils/enum';
import moduleStatuses from './src/core/moduleStatuses';

export {
  Module as default,
  state,
  action,
  Enum,
  PropertyKey,
  Reducer,
  State,
  Action,
  ActionTypes,
  moduleStatuses,
  StaticModule,
  Properties,
}
