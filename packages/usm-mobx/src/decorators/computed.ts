import { computed as computedWithMobx } from 'mobx';
import { computedKey } from '../constant';
import { Service } from '../interface';

export const computed = (
  target: object,
  key: string | symbol,
  descriptor: TypedPropertyDescriptor<any>
) => {
  if (typeof descriptor.get !== 'function') {
    throw new Error(`${String(key)} decorate error with '@computed'.`);
  }
  if (typeof (target as Service)[computedKey] === 'undefined') {
    Object.assign(target, {
      [computedKey]: {
        [key]: computedWithMobx,
      },
    });
  } else {
    Object.assign((target as Service)[computedKey], {
      [key]: computedWithMobx,
    });
  }
  return descriptor;
};
