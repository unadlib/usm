import Enum, {
  prefixEnum,
  createEnum,
} from 'usm/src/utils/enum';

test('`Enum` instance', () => {
  const enumInstance = new Enum([
    'foo',
    'bar'
  ], 'test');
  expect(enumInstance.foo).toEqual('test-foo');
  expect(enumInstance.bar).toEqual('test-bar');
  expect(Object.entries(enumInstance)).toEqual([
    [
      'foo',
      'test-foo',
    ],
    [
      'bar',
      'test-bar',
    ]
  ]);
});

test('`Enum` instance with `createEnum`', () => {
  const enumInstance = createEnum([
    'foo',
    'bar'
  ], 'test');
  expect(enumInstance.foo).toEqual('test-foo');
  expect(enumInstance.bar).toEqual('test-bar');
  expect(Object.entries(enumInstance)).toEqual([
    [
      'foo',
      'test-foo',
    ],
    [
      'bar',
      'test-bar',
    ]
  ]);
});


test('`prefixEnum` pass Enum instance', () => {
  const enumMap = new Enum([
    'foo',
    'bar'
  ], 'test');
  const _prefixEnum = prefixEnum({
    enumMap,
    prefix: 'foobar'
  });
  expect(_prefixEnum).toEqual({
    bar: 'foobar-test-bar',
    foo: 'foobar-test-foo',
  });
});

test('`prefixEnum` with `createEnum` pass Enum instance', () => {
  const enumMap = createEnum([
    'foo',
    'bar'
  ], 'test') as Enum;
  const _prefixEnum = prefixEnum({
    enumMap,
    prefix: 'foobar'
  });
  expect(_prefixEnum).toEqual({
    bar: 'foobar-test-bar',
    foo: 'foobar-test-foo',
  });
});
