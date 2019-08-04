import Module from 'usm/src/core/module';
import moduleStatuses from 'usm/src/core/moduleStatuses';

const sleep = async (time = 0) =>  await new Promise(resolve => setTimeout(resolve, time));

test('create instance default params', () => {
  class Foo extends Module {}
  const modules = {};
  const foo = new Foo();
  expect(foo._modules).toEqual(modules);
  expect(foo.modules).toEqual(modules);
  expect((foo as any).__init__).toBe(false);
  expect((foo as any).__reset__).toBe(false);
  expect(foo._arguments).toEqual({ modules });
  expect(Object.getOwnPropertyDescriptor(foo, '_status')).toEqual({
    configurable: false,
    enumerable: false,
    value: moduleStatuses.initial,
    writable: true,
  });
  expect(typeof Object.getOwnPropertyDescriptor(foo, 'getState').value).toEqual('function');
});


test('create instance', () => {
  class Foo extends Module {}
  const modules = {};
  const getState = () => {};
  const foo = new Foo({ modules, getState });
  expect(foo._modules).toEqual(modules);
  expect(foo.modules).toEqual(modules);
  expect((foo as any).__init__).toBe(false);
  expect((foo as any).__reset__).toBe(false);
  expect(foo._arguments).toEqual({ modules, getState });
  expect(Object.getOwnPropertyDescriptor(foo, '_status')).toEqual({
    configurable: false,
    enumerable: false,
    value: moduleStatuses.initial,
    writable: true,
  });
  expect(Object.getOwnPropertyDescriptor(foo, 'getState')).toEqual({
    configurable: false,
    enumerable: false,
    value: getState,
    writable: false,
  });
});

test('single module lifecycle', async () => {
  const spy = jest.fn();
  class Foo extends Module {
    async moduleDidInitialize() {
      spy('moduleDidInitialize');
    }

    async moduleWillReset() {
      spy('moduleWillReset');
    }

    async moduleWillInitializeSuccess() {
      spy('moduleWillInitializeSuccess');
    }

    async moduleWillInitialize() {
      spy('moduleWillInitialize');
    }

    async moduleDidReset() {
      spy('moduleDidReset');
    }
  }
  const foo = new Foo();
  foo.bootstrap();
  expect(spy.mock.calls).toEqual([
    ['moduleWillInitialize'],
  ]);
  let length = spy.mock.calls.length;
  await sleep();
  expect(spy.mock.calls.slice(length)).toEqual([
    ['moduleWillInitializeSuccess'],
    ['moduleDidInitialize'],
  ]);
  length = spy.mock.calls.length;
  foo.resetModule();
  expect(spy.mock.calls.slice(length)).toEqual([
    ['moduleWillReset']
  ]);
  length = spy.mock.calls.length;
  await sleep();
  expect(spy.mock.calls.slice(length)).toEqual([
    ['moduleWillInitialize'],
    ['moduleDidReset'],
    ['moduleWillInitializeSuccess'],
    ['moduleDidInitialize'],
  ]);
  expect(foo.ready).toEqual(true);
  foo.dispatch({ type: foo.actionTypes.reset });
  expect(foo.ready).toEqual(false);
});

test('create instance', () => {
  class Foo extends Module {}
  const modules = {};
  const getState = () => {};
  const foo = new Foo({ modules, getState });
  expect(foo._modules).toEqual(modules);
  expect(foo.modules).toEqual(modules);
  expect((foo as any).__init__).toBe(false);
  expect((foo as any).__reset__).toBe(false);
  expect(foo._arguments).toEqual({ modules, getState });
  expect(Object.getOwnPropertyDescriptor(foo, '_status')).toEqual({
    configurable: false,
    enumerable: false,
    value: moduleStatuses.initial,
    writable: true,
  });
  expect(Object.getOwnPropertyDescriptor(foo, 'getState')).toEqual({
    configurable: false,
    enumerable: false,
    value: getState,
    writable: false,
  });
});

test('single module lifecycle with `create` bootstrap', async () => {
  const spy = jest.fn();
  class Foo extends Module {
    async moduleDidInitialize() {
      spy('moduleDidInitialize');
    }

    async moduleWillReset() {
      spy('moduleWillReset');
    }

    async moduleWillInitializeSuccess() {
      spy('moduleWillInitializeSuccess');
    }

    async moduleWillInitialize() {
      spy('moduleWillInitialize');
    }

    async moduleDidReset() {
      spy('moduleDidReset');
    }
  }
  const foo = new Foo();
  foo.bootstrap();
  expect(spy.mock.calls).toEqual([
    ['moduleWillInitialize'],
  ]);
  let length = spy.mock.calls.length;
  await sleep();
  expect(spy.mock.calls.slice(length)).toEqual([
    ['moduleWillInitializeSuccess'],
    ['moduleDidInitialize'],
  ]);
  length = spy.mock.calls.length;
  foo.resetModule();
  expect(spy.mock.calls.slice(length)).toEqual([
    ['moduleWillReset']
  ]);
  length = spy.mock.calls.length;
  await sleep();
  expect(spy.mock.calls.slice(length)).toEqual([
    ['moduleWillInitialize'],
    ['moduleDidReset'],
    ['moduleWillInitializeSuccess'],
    ['moduleDidInitialize'],
  ]);
  expect(foo.ready).toEqual(true);
  foo.dispatch({ type: foo.actionTypes.reset });
  expect(foo.ready).toEqual(false);
});


test('multi-modules lifecycle', async () => {
  const spy = jest.fn();
  class Foo extends Module {
    async moduleDidInitialize() {
      spy(`${this.constructor.name} moduleDidInitialize`);
    }

    async moduleWillReset() {
      spy(`${this.constructor.name} moduleWillReset`);
    }

    async moduleWillInitializeSuccess() {
      spy(`${this.constructor.name} moduleWillInitializeSuccess`);
    }

    async moduleWillInitialize() {
      spy(`${this.constructor.name} moduleWillInitialize`);
    }

    async moduleDidReset() {
      spy(`${this.constructor.name} moduleDidReset`);
    }
  }
  class Bar extends Module {
    async moduleDidInitialize() {
      spy(`${this.constructor.name} moduleDidInitialize`);
    }

    async moduleWillReset() {
      spy(`${this.constructor.name} moduleWillReset`);
    }

    async moduleWillInitializeSuccess() {
      spy(`${this.constructor.name} moduleWillInitializeSuccess`);
    }

    async moduleWillInitialize() {
      spy(`${this.constructor.name} moduleWillInitialize`);
    }

    async moduleDidReset() {
      spy(`${this.constructor.name} moduleDidReset`);
    }
  }
  class FooBar extends Module {
    async moduleDidInitialize() {
      spy(`${this.constructor.name} moduleDidInitialize`);
    }

    async moduleWillReset() {
      spy(`${this.constructor.name} moduleWillReset`);
    }

    async moduleWillInitializeSuccess() {
      spy(`${this.constructor.name} moduleWillInitializeSuccess`);
    }

    async moduleWillInitialize() {
      spy(`${this.constructor.name} moduleWillInitialize`);
    }

    async moduleDidReset() {
      spy(`${this.constructor.name} moduleDidReset`);
    }
  }
  const foo = new Foo();
  const bar = new Bar({
    modules: {
      foo
    }
  });
  const fooBar = new FooBar({
    modules: {
      bar
    }
  });
  fooBar.bootstrap();
  expect(spy.mock.calls).toEqual([
    ['FooBar moduleWillInitialize'],
    ['Bar moduleWillInitialize'],
    ['Foo moduleWillInitialize'],
    ['Foo moduleWillInitialize'],
  ]);
  let length = spy.mock.calls.length;
  await sleep();
  expect(spy.mock.calls.slice(length)).toEqual([
    ['Foo moduleWillInitializeSuccess'],
    ['Bar moduleWillInitializeSuccess'],
    ['Foo moduleDidInitialize'],
    ['FooBar moduleWillInitializeSuccess'],
    ['Bar moduleDidInitialize'],
    ['FooBar moduleDidInitialize']
  ]);
  length = spy.mock.calls.length;
  fooBar.resetModule();
  expect(spy.mock.calls.slice(length)).toEqual([
    ['Bar moduleWillReset'],
  ]);
  length = spy.mock.calls.length;
  await sleep();
  expect(spy.mock.calls.slice(length)).toEqual([
    ['Bar moduleWillInitialize'],
    ['Foo moduleWillReset'],
    ['Foo moduleWillInitialize'],
    ['FooBar moduleWillReset'],
    ['Foo moduleWillInitializeSuccess'],
    ['FooBar moduleWillInitialize'],
    ['Bar moduleWillInitializeSuccess'],
    ['Foo moduleDidReset'],
    ['Foo moduleDidInitialize'],
    ['Bar moduleDidReset'],
    ['Bar moduleDidInitialize'],
    ['FooBar moduleDidReset'],
    ['FooBar moduleWillInitializeSuccess'],
    ['FooBar moduleDidInitialize']
  ]);
  expect(foo.ready).toEqual(true);
  foo.dispatch({ type: foo.actionTypes.init });
  expect(foo.ready).toEqual(false);
  expect(fooBar.ready).toEqual(true);
  fooBar.dispatch({ type: fooBar.actionTypes.init });
  expect(fooBar.ready).toEqual(false);
});

test('multi-modules lifecycle with `create` bootstrap', async () => {
  const spy = jest.fn();
  class Foo extends Module {
    async moduleDidInitialize() {
      spy(`${this.constructor.name} moduleDidInitialize`);
    }

    async moduleWillReset() {
      spy(`${this.constructor.name} moduleWillReset`);
    }

    async moduleWillInitializeSuccess() {
      spy(`${this.constructor.name} moduleWillInitializeSuccess`);
    }

    async moduleWillInitialize() {
      spy(`${this.constructor.name} moduleWillInitialize`);
    }

    async moduleDidReset() {
      spy(`${this.constructor.name} moduleDidReset`);
    }
  }
  class Bar extends Module {
    async moduleDidInitialize() {
      spy(`${this.constructor.name} moduleDidInitialize`);
    }

    async moduleWillReset() {
      spy(`${this.constructor.name} moduleWillReset`);
    }

    async moduleWillInitializeSuccess() {
      spy(`${this.constructor.name} moduleWillInitializeSuccess`);
    }

    async moduleWillInitialize() {
      spy(`${this.constructor.name} moduleWillInitialize`);
    }

    async moduleDidReset() {
      spy(`${this.constructor.name} moduleDidReset`);
    }
  }
  class FooBar extends Module {
    async moduleDidInitialize() {
      spy(`${this.constructor.name} moduleDidInitialize`);
    }

    async moduleWillReset() {
      spy(`${this.constructor.name} moduleWillReset`);
    }

    async moduleWillInitializeSuccess() {
      spy(`${this.constructor.name} moduleWillInitializeSuccess`);
    }

    async moduleWillInitialize() {
      spy(`${this.constructor.name} moduleWillInitialize`);
    }

    async moduleDidReset() {
      spy(`${this.constructor.name} moduleDidReset`);
    }
  }
  const foo = new Foo();
  const bar = new Bar({
    modules: {
      foo
    }
  });
  const fooBar = FooBar.create({
    modules: {
      bar
    }
  });
  expect(spy.mock.calls).toEqual([
    ['FooBar moduleWillInitialize'],
    ['Bar moduleWillInitialize'],
    ['Foo moduleWillInitialize'],
    ['Foo moduleWillInitialize'],
  ]);
  let length = spy.mock.calls.length;
  await sleep();
  expect(spy.mock.calls.slice(length)).toEqual([
    ['Foo moduleWillInitializeSuccess'],
    ['Bar moduleWillInitializeSuccess'],
    ['Foo moduleDidInitialize'],
    ['FooBar moduleWillInitializeSuccess'],
    ['Bar moduleDidInitialize'],
    ['FooBar moduleDidInitialize']
  ]);
  length = spy.mock.calls.length;
  fooBar.resetModule();
  expect(spy.mock.calls.slice(length)).toEqual([
    ['Bar moduleWillReset'],
  ]);
  length = spy.mock.calls.length;
  await sleep();
  expect(spy.mock.calls.slice(length)).toEqual([
    ['Bar moduleWillInitialize'],
    ['Foo moduleWillReset'],
    ['Foo moduleWillInitialize'],
    ['FooBar moduleWillReset'],
    ['Foo moduleWillInitializeSuccess'],
    ['FooBar moduleWillInitialize'],
    ['Bar moduleWillInitializeSuccess'],
    ['Foo moduleDidReset'],
    ['Foo moduleDidInitialize'],
    ['Bar moduleDidReset'],
    ['Bar moduleDidInitialize'],
    ['FooBar moduleDidReset'],
    ['FooBar moduleWillInitializeSuccess'],
    ['FooBar moduleDidInitialize']
  ]);
  expect(foo.ready).toEqual(true);
  foo.dispatch({ type: foo.actionTypes.init });
  expect(foo.ready).toEqual(false);
  expect(fooBar.ready).toEqual(true);
  fooBar.dispatch({ type: fooBar.actionTypes.init });
  expect(fooBar.ready).toEqual(false);
});
