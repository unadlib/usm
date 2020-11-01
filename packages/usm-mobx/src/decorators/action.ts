import { action as actionWithMobx } from 'mobx';
import { actionKey, identifierKey, storeKey } from '../constant';
import { Service } from '../interface';

export const action = (
  target: object,
  key: string | symbol,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => void>
) => {
  const fn = descriptor.value;
  if (typeof fn === 'undefined') {
    throw new Error(`${String(key)} decorate error with '@action'.`);
  }
  if (typeof (target as Service)[actionKey] === 'undefined') {
    Object.assign(target, {
      [actionKey]: {
        [key]: actionWithMobx,
      },
    });
  } else {
    Object.assign((target as Service)[actionKey], {
      [key]: actionWithMobx,
    });
  }
  const value = function (this: Service, ...args: unknown[]) {
    this[storeKey]?.dispatch({
      type: this[identifierKey]!,
      method: key,
      params: args,
      _changeState: () => fn.apply(this, args),
    });
  };
  return {
    ...descriptor,
    value
  };
};
