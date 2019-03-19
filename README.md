# USM

[![Travis](https://img.shields.io/travis/unadlib/usm.svg)](https://travis-ci.org/unadlib/usm)
[![npm](https://img.shields.io/npm/v/usm.svg)](https://www.npmjs.com/package/usm)

USM is a universal state modular lib. **It can help you make more concise OOP when using some state library**, and it currently supports Redux, MobX, Vuex and Angular.

## Support

| Libraries/Frameworks   | None  | Redux  | MobX    | Vuex    | Angular2+ |
| :--------------------- | :---: | :----: | :-----: | :-----: | :-------: |
| Status                 | ✅    | ✅     | ✅     | ✅      | ✅        |

## Features

- Universal State Management
- Standardized Module Lifecycle
- Optional Event System
- Support Stateless Model
- Support React/Vue/Angular

## Usage

To install `usm`:

```bash
yarn add usm # npm install --save usm
```

And if you want to use Redux/MobX/Vuex, you just install `usm-redux`/`usm-mobx`/`usm-vuex`.

## Pros

Here is Redux's todo example boilerplate:
```js
import { createStore, combineReducers } from 'redux'

// action
let nextTodoId = 0
const addTodo = text => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text
  }
}

const setVisibilityFilter = filter => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter
  }
}

const toggleTodo = id => {
  return {
    type: 'TOGGLE_TODO',
    id
  }
}

// reducers
const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          completed: false
        }
      ]
    case 'TOGGLE_TODO':
      return state.map(todo =>
        (todo.id === action.id) 
          ? {...todo, completed: !todo.completed}
          : todo
      )
    default:
      return state
  }
}

const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter
    default:
      return state
  }
}

const todoApp = combineReducers({
  todos,
  visibilityFilter
})

```

And this is todo example with `usm-redux`: 
```js
import Module, { state, action } from 'usm-redux'

class TodoList extends Module {
  @state todos = []
  @state visibilityFilter = 'SHOW_ALL'
  nextTodoId = 0

  @action
  add(text, state) {
    this.nextTodoId++
    state.todos.push({
      text,
      id: this.nextTodoId,
      completed: false,
    })
  }

  @action
  toggle(id, state) {
    const todo = state.todos.find(todo => todo.id === id)
    todo.completed = !todo.completed
  }

  @action
  setVisibility(filter, state) {
    state.visibilityFilter = filter
  }
}
```
USM will help you better object-oriented programming when using Redux/Vuex/MobX and so on, in the hope that it is flexible and concise enough.

## Example

```js
class Counter extends Module {
  @state count = 0;

  @action
  increase(state) {
    state.count += 1;
  }

  @action
  decrease(state) {
    state.count -= 1;
  }
}

const counter = Counter.create();

counter.increase();
counter.decrease();
```

Using different interface library:
```js
import Module, { action, state } from 'usm'; // using Native Module/Angular
import Module, { action, state } from 'usm-redux'; // using Redux
import Module, { action, state } from 'usm-mobx'; // using MobX
import Module, { action, state } from 'usm-vuex'; // using Vuex
```

More examples:

- [TodoList with React+Redux/React+MobX/Angular/Vue+Vuex in same design(Ant-Design)](https://github.com/unadlib/usm-examples)

## APIs

### Decorators

`usm` provides decorator `@state` to wrap a variable with a state, and decorator `@action` is used to wrap a function that changes state (the last parameter passed in by the function is always the current state object). `@computed` is used in state `computed`, and it must be an compute function array.

```js
class Shop extends Module {
  @state goods = [];
  @state status = 'close';

  @action
  operate(item, status, state) {
    state.goods.push(item);
    state.status = status;
  }
  // call -> this.operate({ name: 'fruits', amount: 10 }, 'open');

  @computed
  shortages = [
    () => this.goods,
    (goods) => goods.filter(item => item.amount < 5)
  ];
}
```

### Module lifecycle

`usm` provides these lifecycle events:

- `moduleWillInitialize`
- `moduleWillInitializeSuccess`
- `moduleDidInitialize`
- `moduleWillReset`
- `moduleDidReset`

Note: 

If you need to run the USM-based module directly, you must use the module's `create` method, just like the following.

```js
class Something extends Module {}
const thing = Something.create();
```

And if the module is only instantiated, its internal lifecycle will not run.

If a system with multiple dependent module collections needs to run, the modules need to be instantiated and then initialized in the factory module.

```js
class Foo extends Module {}
class Bar extends Module {}
class FoobarFactory extends Module {}
const foo = new Foo();
const bar = new Bar({
  modules: [foo],
});
const foobarFactory = FoobarFactory.create({
  modules: [foo, bar],
});
```

USM does not provide module dependency management, you are free to choose to manually manage dependencies as in the example above, and we recommend that you introduce additional dependency injection libraries to automatically manage dependencies if necessary. For example, using [InversifyJS](https://github.com/inversify/InversifyJS). If you use Angular, you will be able to use Angualr's dependency injection directly.

## FAQ

*1. Can I continue to use the Redux or Vuex plug-in if I use `usm`?*

Of course, you can, but `usm` will soon define its own plug-in APIs to ensure that there is a universal plug-in that can be used.

`usm-redux` using Redux's middleware example:

```js
class ModuleWithMiddleware extends Module {
  static _generateStore({ createStore }, { reducers }) {
    return createStore(reducers, applyMiddleware(...reduxMiddlewares));
  }
}
```

`usm-vuex` using Vuex's plugin example:

```js
class ModuleWithPlugin extends Module {
  plugins = [...vuexPlugins];
}
```

*2. Does it look like `usm-redux` is a state library of mutable type?*

Yes, because Redux immutable operation is not convenient enough, so `usm` introduced [immer](https://github.com/mweststrate/immer). In general, if single-action items are less than 50K, then it comes with a tiny loss of performance that can be ignored for most of the time. For more on some of the performance issues that immer brings, it's [here](https://github.com/mweststrate/immer#performance).

*3. How do you ensure that you use `usm` to switch between different state libraries(usm-redux/usm-vuex/usm-mobx) and that they are running consistently?*

`usm` is not a state library, we are trying to turn it into a standardized state library runner, `usm` defines only generic modules. Based on such a module, any state library based on the `usm` encapsulation can run well.

## TODO

- [x] support own plugins
- [x] support MobX `@computed`
- [x] support Vuex `getters`
- [x] add `reselect` for `usm-redux`
- [x] `store.subscribe` on `usm`
- [ ] universal middleware
- [ ] implement `computed` for `usm`
- [ ] support MobX =< 4 verion for `usm-mobx`
