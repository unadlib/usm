import Module, { state, action, reducer, computed } from '../src';
import createCase from '../../../test/case';
import caseResult from './caseResult';

const logs = [];
const print = console.log;
console.log = (...args) => {
  logs.push(JSON.parse(JSON.stringify(args)));
}
test('simple case', async () => {
  const index = await createCase(Module, state, action, computed);
  expect(logs).toEqual(caseResult);
  expect((index as any).store.getState()).toEqual({
    "__$$default$$__": null,
    "todoList": {
      "__$$default$$__": null,
      "visibilityFilter": "SHOW_ALL",
      "list": [
        {
          "text": "Learn Typescript",
          "completed": true
        },
        {
          "text": "Learn C++",
          "completed": false
        },
        {
          "text": "Learn Go",
          "completed": false
        }
      ]
    },
    "counter": {
      "__$$default$$__": null
    },
    "fooBar": {
      "__$$default$$__": null
    }
  });
});

test('test reducer \'decorator\'', () => {
  class Foo extends Module {
    @state test: { a: number } = { a: 1 };
    @state bar: { a: { b: number; c: { g: number;d: number } }; f: { e: number } } = { a: { b: 1, c: { g: 4,d: 2 } }, f: { e: 3 } };

    @reducer
    changeBar(number, state?) {
      return {
        ...state,
        bar: {
          ...state.bar,
          a: {
            ...state.bar.a,
            c: {
              ...state.bar.a.c,
              d: number
            }
          }
        }
      }
    }
  }

  const foo = Foo.create() as Foo;
  const oldB = foo.bar.a.b;
  const oldC = foo.bar.a.c;
  const oldG = foo.bar.a.c.g;
  const oldF = foo.bar.f;
  const oldTest = foo.test;
  foo.changeBar(10);
  expect(foo.bar.a.c.d).toEqual(10);
  expect(foo.bar.a.b).toEqual(oldB);
  expect(foo.bar.a.c).not.toEqual(oldC);
  expect(foo.bar.a.c.g).toEqual(oldG);
  expect(foo.bar.f).toEqual(oldF);
  expect(foo.test).toEqual(oldTest);
});
