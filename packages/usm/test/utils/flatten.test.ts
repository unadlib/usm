import flatten from 'usm/src/utils/flatten';
import Module from 'usm/src/core/module';

test('`flatten`', () => {
  class Test extends Module {}
  class Foo extends Module {}
  class Bar extends Module {}
  class FooBar extends Module {}
  const test = new Test();
  const foo = new Foo();
  const bar = new Bar();
  const fooBar = new FooBar();
  const tree = {
    _modules: {
      test,
      some: {
        _modules: {
          bar,
          something: 'something',
          bar1: {
            _modules: {
              foo,
              foobar1: {
                _modules: {
                  test1: 'test1'
                }
              },
              foo1: {
                fooBar,
              }
            }
          }
        }
      }
    }
  }
  expect(Object.keys(flatten(tree))).toEqual([
    'test',
    'some',
    'bar',
    'something',
    'bar1',
    'foo',
    'foobar1',
    'test1',
    'foo1'
  ]);
});
