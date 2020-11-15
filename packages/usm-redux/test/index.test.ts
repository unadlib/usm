import { applyPatches } from 'immer';
import { createStore, action, state, computed } from '../index';

test('base', () => {
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

  const [oldState] = Object.values(store.getState());
  expect(oldState).toEqual({ count: { sum: 0 } });
  const fn = jest.fn();
  store.subscribe(() => {
    fn();
  });
  counter.increase();
  const [newState] = Object.values(store.getState());
  expect(newState).toEqual({ count: { sum: 1 } });
  expect(fn.mock.calls.length).toBe(1);
  expect(newState === oldState).toBe(false);
});

test('enablePatches', () => {
  class Counter {
    @state
    count = { sum: 0 };

    @action
    increase() {
      this.count.sum += 1;
    }
  }

  const counter = new Counter();

  const snapshots: Record<string, any>[] = [];

  const store = createStore(
    {
      modules: [counter],
      enablePatches: true,
    },
    undefined,
    {
      reduxMiddleware: [
        ({ getState }) => (next) => (action) => {
          const lastState = getState();
          const result = next(action);
          snapshots.push(applyPatches(lastState, action._patches));
          return result;
        },
      ],
    }
  );
  counter.increase();
  expect(Object.values(snapshots[0])).toEqual([{ count: { sum: 1 } }]);
});
