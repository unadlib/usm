import freeze from 'usm/src/utils/freeze';

const foo = {
  test: 1
};

const freezedFoo = freeze(foo);

test('test freeze set', () => {
  expect(() => {
    (freezedFoo as any).test = 11;
  }).toThrowError("Property 'test' is read only.");
});

test('test freeze delete', () => {
  expect(() => {
    delete (freezedFoo as any).test;
  }).toThrowError("Property 'test' is read only.");
});

test('test freeze get', () => {
  expect((freezedFoo as any).test).toEqual(1);
});

test('test freeze setPrototypeOf', () => {
  expect(() => {
    Object.setPrototypeOf(freezedFoo as any, null)
  }).toThrowError('Frozen Object is read only.');
});

test('test freeze defineProperty', () => {
  expect(() => {
    Object.defineProperty(freezedFoo as any, 'a', {
      value : 37,
      writable : true,
      enumerable : true,
      configurable : true
    });
  }).toThrowError('Property \'a\' is read only.');

  expect(() => {
    Object.defineProperties(freezedFoo as any, {
      a: {
        value : 37,
        writable : true,
        enumerable : true,
        configurable : true
      }
    });
  }).toThrowError('Property \'a\' is read only.');

  expect(() => {
    Object.defineProperties(freezedFoo as any, {
      a: {
        value : 37,
        writable : true,
        enumerable : true,
        configurable : true
      },
      b: {
        value : 37,
        writable : true,
        enumerable : true,
        configurable : true
      }
    });
  }).toThrowError('Property \'a\' is read only.');
});

