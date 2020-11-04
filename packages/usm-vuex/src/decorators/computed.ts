import { storeKey, stateKey } from '../constant';
import { Service } from '../interface';

export const computed = (
  target: object,
  key: string,
  descriptor: TypedPropertyDescriptor<any>
) => {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof descriptor.get !== 'function') {
      throw new Error(`'@computed' should decorate a getter.`);
    }
  }
  return {
    ...descriptor,
  };
};

