import DEFAULT_PROPERTY from '../utils/property';
import freeze from './freeze';


const {
  prototype: { hasOwnProperty },
  entries,
  keys,
  defineProperties,
  defineProperty
} = Object;

type Prefix = string;
type PropertyKey = string;
type PropertyKeys = PropertyKey[];

type Properties<T> = {
  [P in PropertyKey]?: T;
}

interface Enum {
  prefix: Prefix;
  [key: string]: string;
}

interface PrefixEnum {
  enumMap: Enum;
  prefix: Prefix;
  base: Enum;
}

function createEnum<V extends string> (values: V[], prefix: string): { [K in V]: string };

function createEnum(values: string[], prefix: string) {
  const properties: PropertyDescriptorMap = {
    prefix: {
      value: prefix,
      ...DEFAULT_PROPERTY
    },
    size: {
      get() {
        return entries(this).length;
      },
      ...DEFAULT_PROPERTY
    },
    add: {
      value(this: Enum, item: PropertyKey) {
        if (this[item]) {
          throw new Error(`'${item}' enumeration property already exists for this instance`);
        }
        const property = setPrefix(item, this.prefix);
        defineProperty(this, item, property);
      },
      ...DEFAULT_PROPERTY
    },
    remove: {
      value(this: Enum, item: PropertyKey){
        if (!hasOwnProperty.call(this, item)) {
          throw new Error(`'${item}' enumeration property does not exist for this instance`);
        }
        delete this[item];
      },
      ...DEFAULT_PROPERTY
    }
  };
  const enumeration = {} as Enum;
  values.forEach((item) => {
    enumeration[item] = prefix ? `${prefix}-${item}` : item;
  });
  defineProperties(enumeration, properties);
  if (Proxy && Reflect) {
    return freeze(enumeration);
  } else {
    Object.freeze(enumeration);
  }
  return enumeration;
}

const prefixCache: Properties<Properties<Properties<string>>> = {};

function prefixEnum({ enumMap, prefix, base = enumMap }: PrefixEnum) {
  if (!prefix || prefix === '' || !base.prefix) return base;
  if (prefixCache[prefix] === null || typeof prefixCache[prefix] === 'undefined') {
    prefixCache[prefix] = {};
  }
  const cache = prefixCache[prefix];
  if (cache && !cache[base.prefix]) {
    Object.assign(cache, { [base.prefix]: createEnum(keys(enumMap), `${prefix}-${enumMap.prefix}`)});
  }
  return cache && cache[base.prefix];
}

function setPrefix(item: PropertyKey, prefix: Prefix) {
  const value = prefix ? `${prefix}-${item}` : item;
  return {
    value,
    configurable: true,
    enumerable: true,
    writable: true,
  };
}

export {
  prefixCache,
  prefixEnum,
  createEnum,
  Prefix,
  PropertyKey,
  PropertyKeys
};
