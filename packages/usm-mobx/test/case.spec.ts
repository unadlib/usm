import Module, { state, action, computed } from '../src';
import createCase from '../../../test/case';
import caseResult from './caseResult';

const logs = [];
const print = console.log;
console.log = (...args) => {
  logs.push(JSON.parse(JSON.stringify(args)));
}
test('simple case', async () => {
  await createCase(Module, state, action, computed);
  // print(JSON.stringify(logs, null, 2));
  expect(logs).toEqual(caseResult);
});
