import { Service } from '../interface';
import { identifierKey, actionKey, actionsKey, storeKey } from '../constant';

export const action = (
  target: object,
  key: string,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => void>
) => {
  const fn = descriptor.value;
  if (typeof fn === 'undefined') {
    throw new Error(`${String(key)} decorate error with '@action'.`);
  }
  if (typeof (target as Service)[actionsKey] === 'undefined') {
    Object.assign(target, {
      [actionsKey]: {
        [key]: fn,
      },
    });
  } else {
    (target as Service)[actionsKey]![key] = fn!;
  }
  const value = function (this: Service, ...args: unknown[]) {
    this[storeKey]!.dispatch({
      type: this[identifierKey]!,
      method: key,
      params: args,
      _state: this[storeKey]!.state,
      _usm: actionKey,
    });
  };
  return {
    ...descriptor,
    value,
  };
};
