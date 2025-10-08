type Callback = (...args: any[]) => void;

type Subscription = {
  callback: Callback;
  once: boolean;
};

type EventType = string | symbol;

type Events<T = Subscription> = Map<EventType, T[]>;

interface EventOptions {
  /**
   * Subscriptions are notified of events only once.
   */
  once?: boolean;
  /**
   * Subscribe to priority notifications for the current event.
   */
  priority?: boolean;
}

export class EventEmitter {
  protected _events: Events = new Map();

  on(
    eventType: EventType,
    callback: Callback,
    { once = false, priority = false }: EventOptions = {}
  ) {
    const listeners = this._events.get(eventType) || [];
    const isExist =
      listeners.filter((listener) => listener.callback === callback).length > 0;
    const listener = { callback, once };
    if (isExist) {
      throw new Error(
        `Event type '${eventType.toString()}' has been registered, please re-register it.`
      );
    }
    if (priority) {
      listeners.unshift(listener);
    } else {
      listeners.push(listener);
    }
    this._events.set(eventType, listeners);
  }

  off(eventType: EventType, callback: Callback) {
    const listeners = this._events.get(eventType);
    if (listeners) {
      const index = listeners.findIndex(
        (listener) => listener.callback === callback
      );
      const isExist = index > -1;
      if (isExist) {
        listeners.splice(index, 1);
      }
    }
  }

  remove(eventType: EventType) {
    if (this._events.get(eventType)) {
      return this._events.delete(eventType);
    }
    return false;
  }

  emit(eventType: EventType, ...args: any[]) {
    const listeners = this._events.get(eventType);
    if (!Array.isArray(listeners) || listeners.length === 0) return;
    [...listeners].forEach(({ callback, once }, index) => {
      if (once) {
        listeners.splice(index, 1);
      }
      if (Array.isArray(args)) callback.apply(this, args);
    });
  }
}
