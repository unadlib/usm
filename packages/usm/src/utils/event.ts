// const __DEV__ = process.env.NODE_ENV === 'development';
const __DEV__ = false;

type Callback = {
  (): void;
}

type Subscription = {
  callback: Callback;
  once: boolean;
}

type EventType = string;

type EventListMapping<T> = {
  [P in EventType]: T[]
}

interface Event {
  _events: EventListMapping<Subscription>;
}

class Event implements Event{
  constructor() {
    this._events = {};
  }

  on(
    eventType: EventType,
    callback: Callback,
    {
      once = false,
      priority = false,
    } = {}
  ) {
    const listeners = this._events[eventType] || [];
    const isExist = listeners.filter(listener => listener.callback === callback).length > 0;
    const listener = {callback, once};
    if (isExist) {
      throw new Error(`Event type ${eventType} has been registered, please re-register it.`);
    }
    if (priority) {
      listeners.unshift(listener);
    } else {
      listeners.push(listener);
    }
    this._events[eventType] = listeners;
  }

  off(
    eventType: EventType,
    callback: Callback,
  ) {
    const listeners = this._events[eventType];
    if (listeners) {
      const index = listeners
        .findIndex(listener => listener.callback === callback);
      const isExist = index > -1;
      if (isExist) {
        listeners.splice(index, 1);
      } else if (__DEV__) {
        console.warn(`Event type '${eventType}' listener removed the failure.`);
      }
    } else if (__DEV__){
      console.warn(`Event type '${eventType}' does not exist.`);
    }
  }

  remove(eventType: EventType) {
    if (this._events[eventType]) {
      delete this._events[eventType];
    } else if(__DEV__) {
      console.warn(`Event type '${eventType}' does not exist.`);
    }
  }

  emit(eventType: EventType, ...args:[]) {
    const listeners = this._events[eventType];
    if (
      !Array.isArray(listeners)
    ) {
      throw new Error(`Event type ${eventType} should be registered before emit it.`);
    } else if (listeners.length === 0) {
      throw new Error(`Event type ${eventType} has not any listener.`);
    }
    [...listeners].forEach(({ callback, once }, index) => {
      if (once) {
        listeners.splice(index, 1);
      }
      callback.apply(this, args);
    });
  }
}

const event = new Event();

export {
  event as default,
  Event
}
