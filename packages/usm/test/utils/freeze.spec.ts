import freeze from '../../src/utils/freeze';

const foo = {
  test: 1
};

const freezedFoo = freeze(foo);

test('test freeze set', () => {
  expect(() => {
    (freezedFoo as any).test = 11;
  }).toThrowError("Property 'test' is read only.");
});
