import * as usm from 'usm';
import * as usmMobx from 'usm-mobx';
import * as usmRedux from 'usm-redux';
import * as usmVuex from 'usm-vuex';

const packagesWithObservable = { usmMobx, usmVuex };

const packagesWithImmutable = { usm, usmRedux };

const packages = { ...packagesWithImmutable, ...packagesWithObservable };

test('base', () => {
  for (const key in packages) {
    const { createStore, action, state } = packages[
      key as keyof typeof packages
    ];
    class Counter {
      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }
    }

    const counter = new Counter();

    const store = createStore({
      modules: [counter],
    });

    const oldState = Object.values(store.getState())[0] as Counter;
    expect(oldState.count).toEqual({ sum: 0 });
    const fn = jest.fn();
    store.subscribe(() => {
      fn();
    });
    counter.increase();
    const newState = Object.values(store.getState())[0] as Counter;
    expect(newState.count).toEqual({ sum: 1 });
    expect(fn.mock.calls.length).toBe(1);
  }
});

test('base with { strict: true }', () => {
  for (const key in packages) {
    const { createStore, action, state } = packages[
      key as keyof typeof packages
    ];
    class Counter {
      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }
    }

    const counter = new Counter();

    const store = createStore({
      modules: [counter],
      strict: true,
    });

    const oldState = Object.values(store.getState())[0] as Counter;
    expect(oldState.count).toEqual({ sum: 0 });
    const fn = jest.fn();
    store.subscribe(() => {
      fn();
    });
    counter.increase();
    const newState = Object.values(store.getState())[0] as Counter;
    expect(newState.count).toEqual({ sum: 1 });
    expect(fn.mock.calls.length).toBe(1);
    if (key !== 'usmMobx') {
      expect(() => (counter.count.sum += 1)).toThrow();
    } else {
      const list: string[] = [];
      global.console.warn = (msg: string) => list.push(msg);
      counter.count.sum += 1;
      expect(list.slice(-1)[0]).toMatch(
        '[MobX] Since strict-mode is enabled, changing (observed) observable values without using an action is not allowed.'
      );
    }
  }
});

test('base with immutable computed', () => {
  for (const key in packagesWithImmutable) {
    const { createStore, action, state, computed } = packagesWithImmutable[
      key as keyof typeof packagesWithImmutable
    ];
    const computedFn = jest.fn();
    class Counter {
      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }

      @computed(({ count }: Counter) => [count.sum])
      get sum() {
        computedFn();
        return this.count.sum + 1;
      }
    }

    const counter = new Counter();

    const store = createStore({
      modules: [counter],
    });

    const oldState = Object.values(store.getState())[0] as Counter;
    expect(oldState.count).toEqual({ sum: 0 });
    const fn = jest.fn();
    store.subscribe(() => {
      fn();
    });
    counter.increase();
    const newState = Object.values(store.getState())[0] as Counter;
    expect(newState.count).toEqual({ sum: 1 });
    expect(fn.mock.calls.length).toBe(1);
  }
});

test('base with observable computed', () => {
  for (const key in packagesWithObservable) {
    const { createStore, action, state, computed } = packagesWithObservable[
      key as keyof typeof packagesWithObservable
    ];
    const computedFn = jest.fn();
    class Counter {
      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }

      @computed
      get sum() {
        computedFn();
        return this.count.sum + 1;
      }
    }

    const counter = new Counter();

    const store = createStore({
      modules: [counter],
    });

    const oldState = Object.values(store.getState())[0] as Counter;
    expect(oldState.count).toEqual({ sum: 0 });
    const fn = jest.fn();
    store.subscribe(() => {
      fn();
    });
    counter.increase();
    const newState = Object.values(store.getState())[0] as Counter;
    expect(newState.count).toEqual({ sum: 1 });
    expect(fn.mock.calls.length).toBe(1);
  }
});
