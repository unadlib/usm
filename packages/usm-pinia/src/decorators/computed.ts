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
        [key]: descriptor.get,
      },
    });
  } else {
    Object.assign((target as Service)[computedKey], {
      [key]: descriptor.get,
    });
  }
  return descriptor;
};
