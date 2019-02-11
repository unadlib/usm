# usm
Universal state module

Using USM to develop a modular application system, it can directly support React/Vue/Angular.

## Support State Management Libraries/Frameworks

| Libraries/Frameworks   | None  | Redux  | MobX    | Vuex    | Angular2+ |
| :--------------------- | :---: | :----: | :-----: | :-----: | :-------: |
| Support                | Yes   | Yes    | Ongoing | Pending | Pending   |

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
  @state list = [{item: "Learn Typescript"}]

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
// or, etc.
import Module, { action, state } from 'usm-mobx';
```

Done.