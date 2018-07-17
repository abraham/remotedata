import { Failure, fold, Initialized, Pending, Success } from './index';

test('Initialized', () => {
  expect(new Initialized()).toBeInstanceOf(Initialized);
  expect(new Initialized().kind).toEqual('Initialized');
});

test('Pending', () => {
  expect(new Pending()).toBeInstanceOf(Pending);
  expect(new Pending().kind).toEqual('Pending');
});

test('Success', () => {
  const data = { apple: 'sauce' };
  const state = new Success(data);
  expect(state).toBeInstanceOf(Success);
  expect(state.kind).toEqual('Success');
  expect(state.data).toEqual(data);
});

test('Success without data', () => {
  expect(() => new Success()).toThrowError('Parameter "data" is required');
});

test('Failure', () => {
  const error = 500;
  const state = new Failure(error);
  expect(state).toBeInstanceOf(Failure);
  expect(state.kind).toEqual('Failure');
  expect(state.error).toEqual(error);
});

test('Failure without error', () => {
  expect(() => new Failure()).toThrowError('Parameter "error" is required');
});

test('fold initialized', () => {
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const view = fold(
    initializedMock,
    pendingMock,
    successMock,
    failureMock,
  );

  view(new Initialized());
  expect(initializedMock).toHaveBeenCalledTimes(1);
  expect(initializedMock).toHaveBeenCalledWith();
  expect(pendingMock).not.toHaveBeenCalled();
  expect(successMock).not.toHaveBeenCalled();
  expect(failureMock).not.toHaveBeenCalled();
});

test('fold pending', () => {
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const view = fold(
    initializedMock,
    pendingMock,
    successMock,
    failureMock,
  );

  view(new Pending());
  expect(initializedMock).not.toHaveBeenCalled();
  expect(pendingMock).toHaveBeenCalledTimes(1);
  expect(pendingMock).toHaveBeenCalledWith();
  expect(successMock).not.toHaveBeenCalled();
  expect(failureMock).not.toHaveBeenCalled();
});

test('fold success', () => {
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const view = fold(
    initializedMock,
    pendingMock,
    successMock,
    failureMock,
  );

  const data = { apple: 'sauce' };
  view(new Success(data));
  expect(initializedMock).not.toHaveBeenCalled();
  expect(pendingMock).not.toHaveBeenCalled();
  expect(successMock).toHaveBeenCalledTimes(1);
  expect(successMock).toHaveBeenCalledWith(data);
  expect(failureMock).not.toHaveBeenCalled();
});

test('fold failure', () => {
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const view = fold(
    initializedMock,
    pendingMock,
    successMock,
    failureMock,
  );

  const error = 500;
  view(new Failure(error));
  expect(initializedMock).not.toHaveBeenCalled();
  expect(pendingMock).not.toHaveBeenCalled();
  expect(successMock).not.toHaveBeenCalled();
  expect(failureMock).toHaveBeenCalledTimes(1);
  expect(failureMock).toHaveBeenCalledWith(error);
});

test('fold unknown', () => {
  const otherMock = jest.fn();
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const view = fold(
    initializedMock,
    pendingMock,
    successMock,
    failureMock,
  );

  expect(() => view(otherMock)).toThrowError('Unknown RemoteData type used');
});
