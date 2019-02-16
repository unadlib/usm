# usm

Using USM to develop a modular application system, it can directly support React/Vue/Angular.

## Support

| Libraries/Frameworks   | None  | Redux  | MobX    | Vuex    | Angular2+ |
| :--------------------- | :---: | :----: | :-----: | :-----: | :-------: |
| Status                 | ✅    | ✅      | ✅      | ✅      | Pending   |

## Features

- Universal State Management
- Unified Lifecycle
- Optional Event System
- Native Module Minimize Version
- Support React/Vue/Angular

## Usage

It's an universal JavaScript code.
```js
class TodoList extends Module {
  @state list = [{item: 'Learn Typescript'}]

  @action
  add(todo, state) {
    state.list.push(todo);
  }

  async moduleDidInitialize() {
    this.add({item: 'Learn C++'});
  }
}
```

Using different interface llibrary
```js
import Module, { action, state } from 'usm-redux';
// or
import Module, { action, state } from 'usm-mobx';
// or, etc.
import Module, { action, state } from 'usm-vuex';
```

Done.

## TODO

- [ ] support MobX `@computed`
- [ ] support Vuex `getters`
- [ ] add `reselect` for `usm-redux`
- [ ] support `Angular2+`
