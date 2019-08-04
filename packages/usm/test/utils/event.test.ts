import event, { Event } from 'usm/src/utils/event';
import { exec } from 'child_process';

test('event `on` & `emit`', () => {
  const spy = jest.fn();
  event.on('test', (...args: any[]) => {
    spy('on callback', ...args);
  });
  event.emit('test', 'foo', 'bar');
  expect(spy.mock.calls).toEqual([
    ['on callback', 'foo', 'bar']
  ]);
})

test('event `on`, `emit` & `remove`', () => {
  const spy = jest.fn();
  event.on('test', (...args: any[]) => {
    spy('on callback', ...args);
  });
  event.remove('test');
  try {
    event.emit('test', 'foo', 'bar');
  } catch(e) {
    expect(e.toString()).toEqual('Error: Event type \'test\' should be registered before emit it.');
  }
})

test('event `on`, `emit` & `off`', () => {
  const spy = jest.fn();
  const callback = (...args: any[]) => {
    spy('on callback', ...args);
  };
  event.on('test', callback);
  event.off('test', callback);
  try {
    event.emit('test', 'foo', 'bar');
  } catch(e) {
    expect(e.toString()).toEqual('Error: Event type \'test\' has not any listener.');
  }
  event.on('test', callback);
  event.emit('test', 'foo', 'bar');
  expect(spy.mock.calls).toEqual([
    ['on callback', 'foo', 'bar']
  ])
})

test('event `on` about duplication', () => {
  const spy = jest.fn();
  const callback = (...args: any[]) => {
    spy('on callback', ...args);
  };
  event.on('test', callback);
  try {
    event.on('test', callback);
  } catch(e) {
    expect(e.toString()).toEqual('Error: Event type \'test\' has been registered, please re-register it.');
  }
})

test('event `emit` with multi-listeners', () => {
  const spy = jest.fn();
  const callback = (...args: any[]) => {
    spy('on callback', ...args);
  };
  const callback1 = (...args: any[]) => {
    spy('on callback1', ...args);
  };
  event.on('test', callback);
  event.on('test', callback1);
  event.emit('test', 'foo', 'bar');
  expect(spy.mock.calls).toEqual([
    ['on callback', 'foo', 'bar'],
    ['on callback1', 'foo', 'bar']
  ]);
})


test('event `emit` with multi-listeners include remove inner-listener function', () => {
  const spy = jest.fn();
  const callback = (...args: any[]) => {
    event.off('test', callback1);
  };
  const callback1 = (...args: any[]) => {
    spy('on callback1', ...args);
  };
  event.on('test', callback);
  event.on('test', callback1);
  event.emit('test', 'foo', 'bar');
  expect(spy.mock.calls).toEqual([
    ['on callback1', 'foo', 'bar']
  ]);
  event.emit('test', 'foo', 'bar');
  expect(spy.mock.calls).toEqual([
    ['on callback1', 'foo', 'bar']
  ]);
})