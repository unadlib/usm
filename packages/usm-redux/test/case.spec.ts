import Module, { state, action, computed } from '../src';
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
