import { runInAction } from 'mobx';
import { createStore, action, state, computed } from '../index';

test('base', () => {
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
    strict: true,
  });

  const [oldState] = Object.values(store.getState());
  expect(oldState.count).toEqual({ sum: 0 });
  const fn = jest.fn();
  store.subscribe(() => {
    fn();
  });
  counter.increase();
  const [newState] = Object.values(store.getState());
  expect(newState.count).toEqual({ sum: 1 });
  expect(fn.mock.calls.length).toBe(1);

  expect(newState === oldState).toBe(true);

  runInAction(() => {
    counter.sum;
    counter.sum;
    expect(computedFn.mock.calls.length).toBe(1);
  });
});
