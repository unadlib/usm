import { PropertyKeys, Prefix, createEnum } from '../utils/enum';

export default function getActionTypes(
  actionsTypes: PropertyKeys = [],
  prefix: Prefix
) {
  const initialEnum = createEnum([
    'init',
    'initSuccess',
    'reset',
  ], prefix);
  return Object.assign(
    {},
    initialEnum,
    createEnum(actionsTypes, prefix)
  );
}
