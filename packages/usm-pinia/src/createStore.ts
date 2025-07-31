import { ref, computed as vueComputed, watch } from 'vue';
import { defineStore, createPinia } from 'pinia';
import { EventEmitter } from './utils/index';
import {
  changeStateKey,
  identifierKey,
  stateKey,
  storeKey,
  computedKey,
  actionKey,
  bootstrappedKey,
  subscriptionsKey,
  piniaStoreKey,
  moduleRefKey,
} from './constant';
import type {
  StoreOptions,
  Store,
  Action,
  Subscription,
  Config,
  Service,
} from './interface';

declare const __DEV__: boolean;

export const createStore = (
  options: StoreOptions,
  preloadedState?: Record<string, any>,
  config: Config = {}
): Store => {
  const autoRunComputed = config.autoRunComputed ?? true;
  const strict = options.strict ?? (typeof __DEV__ !== 'undefined' ? __DEV__ : false);

  // Create or use provided Pinia instance
  const pinia = options.pinia ?? createPinia();

  let state: Record<string, any> = {};
  const subscriptions: Subscription[] = [];
  const identifiers = new Set<string>();
  const eventEmitter = new EventEmitter();
  const piniaStores: Record<string, any> = {};
  const forceUpdateCounter = ref(0);

  const store: Store = {
    dispatch: (action: Action) => {
      action._changeState.apply(null, action.params);
      eventEmitter.emit(changeStateKey);
    },
    getState: () => state,
    subscribe: (subscription) => {
      eventEmitter.on(changeStateKey, subscription);
      return () => eventEmitter.off(changeStateKey, subscription);
    },
    pinia,
  };

  options.modules.forEach((module, index) => {
    if (typeof module !== 'object' || module === null) return;
    const service: Service = module;
    const className = Object.getPrototypeOf(service).constructor.name;

    if (typeof service[stateKey] === 'undefined' || service[bootstrappedKey]) {
      if (strict) {
        if (service[bootstrappedKey]) {
          console.warn(
            `The module with an index of ${index} and a name of ${className} in the module list is a duplicate module.`
          );
        }
      }
      return;
    }

    let identifier = service[identifierKey] ?? service.name ?? className;
    if (identifier === null || typeof identifier === 'undefined') {
      identifier = `@@usm-pinia/${className}/${Math.random().toString(36)}`;
    }
    if (typeof identifier !== 'string') {
      if (strict) {
        console.error(`
          Since '${className}' module has set the module state, '${className}' module must set a unique and valid class property 'name' to be used as the module index.
          Example:
            class FooBar {
              name = 'FooBar'; // <- add the 'name' property.
            }
        `);
      } else {
        throw new Error(
          `'${className}' module 'name' property should be defined as a valid 'string'.`
        );
      }
    }
    if (identifiers.has(identifier)) {
      identifier += `${index}`;
    }
    identifiers.add(identifier);

    // Create Pinia store for this module
    const usePiniaStore = defineStore(identifier, () => {
      const moduleState: Record<string, any> = {};
      const moduleRefs: Record<string, any> = {};
      const moduleComputed: Record<string, any> = {};
      const moduleActions: Record<string, any> = {};

      // Setup state
      if (service[stateKey]) {
        for (const key in service[stateKey]) {
          const descriptor = Object.getOwnPropertyDescriptor(service, key);
          if (typeof descriptor === 'undefined') continue;
          let initialValue = descriptor.value;
          if (
            preloadedState &&
            preloadedState[identifier] &&
            Object.hasOwnProperty.call(preloadedState[identifier], key)
          ) {
            initialValue = preloadedState[identifier][key];
          }
          moduleRefs[key] = ref(initialValue);
          moduleState[key] = moduleRefs[key];
        }
      }

      // Setup computed properties
      if (service[computedKey]) {
        for (const key in service[computedKey]) {
          const getter = service[computedKey][key];
          moduleComputed[key] = vueComputed(() => getter.call(service));
        }
      }

      // Setup actions
      if (service[actionKey]) {
        for (const key in service[actionKey]) {
          const actionFn = service[actionKey][key];
          moduleActions[key] = (...args: any[]) => {
            return actionFn.apply(service, args);
          };
        }
      }

      return {
        ...moduleState,
        ...moduleComputed,
        ...moduleActions,
      };
    });

    const piniaStore = usePiniaStore(pinia);
    piniaStores[identifier] = piniaStore;

    // Setup descriptors for the service
    const descriptors: Record<string, PropertyDescriptor> = {
      [bootstrappedKey]: {
        enumerable: false,
        configurable: false,
        value: true,
      },
      [identifierKey]: {
        configurable: false,
        enumerable: false,
        value: identifier,
      },
      [storeKey]: {
        configurable: false,
        enumerable: false,
        get() {
          return store;
        },
      },
      [piniaStoreKey]: {
        configurable: false,
        enumerable: false,
        get() {
          return piniaStore;
        },
      },
      [moduleRefKey]: {
        configurable: false,
        enumerable: false,
        value: {},
      },
    };

    // Apply descriptors to service before using them
    Object.defineProperties(service, descriptors);

    // Link state properties
    if (service[stateKey]) {
      state[identifier] = {};
      for (const key in service[stateKey]) {
        const descriptor = Object.getOwnPropertyDescriptor(service, key);
        if (typeof descriptor === 'undefined') continue;
        let initialValue = descriptor.value;
        if (
          preloadedState &&
          preloadedState[identifier] &&
          Object.hasOwnProperty.call(preloadedState[identifier], key)
        ) {
          initialValue = preloadedState[identifier][key];
        }

        // Create ref and store it
        const vueRef = ref(initialValue);
        service[moduleRefKey][key] = vueRef;

        // Create getter/setter for state access
        Object.defineProperty(service, key, {
          get() {
            // Return the raw ref value but make it reactive for computed tracking
            return vueRef.value;
          },
          set(value: unknown) {
            vueRef.value = value;
          },
          enumerable: true,
          configurable: true,
        });

        // Create getter for global state
        Object.defineProperty(state[identifier], key, {
          get() {
            return vueRef.value;
          },
          set(value: unknown) {
            vueRef.value = value;
          },
          enumerable: true,
          configurable: true,
        });
      }
      // @ts-ignore
      descriptors[stateKey] = {
        enumerable: false,
        configurable: false,
        get(this: typeof service) {
          return state[identifier];
        },
      };
    }

    // Link computed properties
    if (service[computedKey]) {
      for (const key in service[computedKey]) {
        const getter = service[computedKey][key];

        const computedRef = vueComputed(() => {
          // Force dependency tracking by accessing all state refs first
          if (service[stateKey]) {
            for (const stateProp in service[stateKey]) {
              // Access the ref to establish dependency
              service[moduleRefKey][stateProp].value;
            }
          }
          return getter.call(service);
        });

        Object.defineProperty(service, key, {
          get() {
            return computedRef.value;
          },
          enumerable: true,
          configurable: true,
        });

        // Auto-run computed if enabled
        if (autoRunComputed) {
          // Trigger the computed to run by accessing its value
          computedRef.value;
        }
      }
    }

    // Watch for state changes to trigger subscriptions
    if (service[stateKey]) {
      for (const key in service[stateKey]) {
        const vueRef = service[moduleRefKey][key];
        watch(vueRef, (newVal, oldVal) => {
          eventEmitter.emit(changeStateKey);
        }, { deep: true });
      }
    }

    if (Array.isArray(service[subscriptionsKey])) {
      Array.prototype.push.apply(subscriptions, service[subscriptionsKey]);
    }
  });

  if (strict) {
    Object.freeze(state);
  }

  for (const subscribe of subscriptions) {
    subscribe();
  }

  return store;
};
