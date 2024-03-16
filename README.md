# USM

![Node CI](https://github.com/unadlib/usm/workflows/Node%20CI/badge.svg)
[![npm](https://img.shields.io/npm/v/usm.svg)](https://www.npmjs.com/package/usm)

USM is a universal state modular library, supports Redux(4.x), MobX(6.x), Vuex(4.x) and Angular(2.0+).

## Motivation

`usm` provides a generic state model that is class-first, which help us to be OOP at almost no cost and is compatible with the ecology of every state library.

When you don't want to learn the paradigm of any state library, `usm` can help you use any state library. When your project's business code is based on `usm`, the architecture will be more flexible.

## Support

| Libraries/Frameworks | None | Redux | MobX | Vuex | Angular2+ |
| :------------------- | :--: | :---: | :--: | :--: | :-------: |
| Status               |  ✅  |  ✅   |  ✅  |  ✅  |    ✅     |

## Installation

To install `usm`:

```bash
yarn add usm # npm install --save usm
```

**And if you want to use Redux/MobX/Vuex, you just install `usm-redux`/`usm-mobx`/`usm-vuex`.**

## Usage

- Use `@state` to decorate a module state.

- Use `@action` to decorate a module method for state changes.

- Use `createStore` to create a store.

```ts
import { state, action, createStore } from 'usm';
// You can also use `usm-redux`, `usm-mobx`, or`usm-vuex`.

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

counter.increase();

const newState = Object.values(store.getState())[0] as Counter;
expect(newState.count).toEqual({ sum: 1 });
```

## Examples

- [React](https://github.com/unadlib/usm-redux-demo)
- [Vue](https://github.com/unadlib/usm-vuex-demo)

## APIs

### `@state`

Define a shared state for a module, and you can use `@state` for decoration. When use `usm-redux`, the state is not allowed to be `undefined`.

For example,

```ts
class Counter {
  @state
  number = 0;
}
```

### `@action`

All operations that change state must be in a method decorated by `@action`.

For example,

```ts
class Counter {
  @state
  number = 0;

  @action
  increase() {
    this.number += 1;
  }
}
```

### `@computed/@computed()`

It is used for computing derived data.

> When use `usm-mobx` or `usm-vuex`, you just use `@computed`, Since it is an observable model, its dependency collection is automatic,
> And When use `usm` or `usm-redux`, you also use `@computed`, Since it is an signal model, its dependency collection is also automatic.

For example,

```ts
class Counter {
  @state
  count = { sum: 0 };

  @state
  number = 0;

  @action
  increase() {
    this.number += 1;
  }

  @computed
  get sum() {
    return this.count.sum + this.number;
  }
}
```

- If you want to manually control dependencies with `usm` or `usm-redux`, you can use `@computed(depsCallback)`, The return value of the `depsCallback` is an array of dependent value collections that tells the module that its getter will recompute when there is a change in any of the values in the value collections:

For example,

```ts
class Counter {
  @state
  count = { sum: 0 };

  @state
  number = 0;

  @action
  increase() {
    this.number += 1;
  }

  @computed((that) => [that.count.sum, that.number])
  get sum() {
    return this.count.sum + this.number;
  }
}
```

### `createStore()`

Creates a `usm` store that holds the complete shared state.

#### Arguments

- `options`(_object_)
  - `modules`(_array_): an array with all modules instances
  - [`strict`] (_boolean_): enable strict mode
- [`preloadedState`] (_any_): preloaded state
- [`plugins`/`middleware`] (_any_[]): vuex's plugins or redux's middleware

For example,

```ts
class Counter {
  @state
  number = 0;

  @action
  increase() {
    this.number += 1;
  }
}

const counter = new Counter();

const store = createStore({
  modules: [counter],
});
```

### `subscribe()`

You can use `subscribe()` to subscribe state changes in any class module.

For example,

```ts
class Counter {
  constructor() {
    subscribe(this, () => {
      //
    });
  }

  @state
  count = { sum: 0 };
}
```

### `watch()`

You can use `watch()` to observe a specific state changes in any class module.

For example,

```ts
class Counter {
  constructor() {
    watch(
      this,
      () => this.count.sum,
      (newValue, oldValue) => {
        //
      }
    );
  }

  @state
  count = { sum: 0 };
}
```

You can pass the option `{ multiple: true }`, which will support watching multiple values.

For example,

```ts
class Counter {
  constructor() {
    watch(
      this,
      () => [this.count0, this.count1],
      ([newCount0, newCount1], [oldCount0, oldCount0]) => {
        //
      },
      {
        multiple: true,
      }
    );
  }

  @state
  count0 = 0;

  @state
  count1 = 0;
}
```

> `watch` option supports passing in `isEqual` function for custom equal.
