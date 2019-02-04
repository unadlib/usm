import Enum, { PropertyKeys, Prefix } from '../utils/enum';


export default function getActionTypes(
  actionsTypes: PropertyKeys = [],
  prefix: Prefix
) {
  return new Enum([
    'init',
    'initSuccess',
    'reset',
    ...actionsTypes,
  ], prefix);
}
