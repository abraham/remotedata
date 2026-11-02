import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import {
  Failure,
  fold,
  Initialized,
  isFailure,
  isInitialized,
  isPending,
  isSuccess,
  Kinds,
  Pending,
  Success,
} from '../dist/index.js';

function foldMocks() {
  const initializedMock = mock.fn();
  const pendingMock = mock.fn();
  const successMock = mock.fn();
  const failureMock = mock.fn();
  const view = fold(initializedMock, pendingMock, failureMock, successMock);
  return { initializedMock, pendingMock, successMock, failureMock, view };
}

test('Kinds', () => {
  assert.deepEqual(
    { ...Kinds },
    {
      Failure: 'Failure',
      Initialized: 'Initialized',
      Pending: 'Pending',
      Success: 'Success',
    },
  );
});

test('Initialized', () => {
  assert.ok(new Initialized() instanceof Initialized);
  assert.equal(new Initialized().kind, 'Initialized');
  assert.ok(isInitialized(new Initialized()));
  assert.ok(!isInitialized(new Pending()));
});

test('Pending', () => {
  assert.ok(new Pending() instanceof Pending);
  assert.equal(new Pending().kind, 'Pending');
  assert.ok(isPending(new Pending()));
  assert.ok(!isPending(new Initialized()));
});

test('Success', () => {
  const data = { apple: 'sauce' };
  const state = new Success(data);
  assert.ok(state instanceof Success);
  assert.equal(state.kind, 'Success');
  assert.deepEqual(state.data, data);
  assert.ok(isSuccess(state));
  assert.ok(!isSuccess(new Initialized()));
});

test('Success without data', () => {
  // @ts-expect-error data is required
  assert.throws(() => new Success(), /Parameter "data" is required/);
  assert.throws(() => new Success(null), /Parameter "data" is required/);
  assert.throws(() => new Success(undefined), /Parameter "data" is required/);
});

test('Failure', () => {
  const error = 500;
  const state = new Failure(error);
  assert.ok(state instanceof Failure);
  assert.equal(state.kind, 'Failure');
  assert.equal(state.error, error);
  assert.ok(isFailure(state));
  assert.ok(!isFailure(new Initialized()));
});

test('Failure without error', () => {
  // @ts-expect-error error is required
  assert.throws(() => new Failure(), /Parameter "error" is required/);
  assert.throws(() => new Failure(null), /Parameter "error" is required/);
  assert.throws(() => new Failure(undefined), /Parameter "error" is required/);
});

test('fold initialized', () => {
  const { initializedMock, pendingMock, successMock, failureMock, view } =
    foldMocks();

  view(new Initialized());
  assert.equal(initializedMock.mock.callCount(), 1);
  assert.deepEqual(initializedMock.mock.calls[0]?.arguments, []);
  assert.equal(pendingMock.mock.callCount(), 0);
  assert.equal(successMock.mock.callCount(), 0);
  assert.equal(failureMock.mock.callCount(), 0);
});

test('fold pending', () => {
  const { initializedMock, pendingMock, successMock, failureMock, view } =
    foldMocks();

  view(new Pending());
  assert.equal(initializedMock.mock.callCount(), 0);
  assert.equal(pendingMock.mock.callCount(), 1);
  assert.deepEqual(pendingMock.mock.calls[0]?.arguments, []);
  assert.equal(successMock.mock.callCount(), 0);
  assert.equal(failureMock.mock.callCount(), 0);
});

test('fold success', () => {
  const { initializedMock, pendingMock, successMock, failureMock, view } =
    foldMocks();

  const data = { apple: 'sauce' };
  view(new Success(data));
  assert.equal(initializedMock.mock.callCount(), 0);
  assert.equal(pendingMock.mock.callCount(), 0);
  assert.equal(successMock.mock.callCount(), 1);
  assert.deepEqual(successMock.mock.calls[0]?.arguments, [data]);
  assert.equal(failureMock.mock.callCount(), 0);
});

test('fold failure', () => {
  const { initializedMock, pendingMock, successMock, failureMock, view } =
    foldMocks();

  const error = 500;
  view(new Failure(error));
  assert.equal(initializedMock.mock.callCount(), 0);
  assert.equal(pendingMock.mock.callCount(), 0);
  assert.equal(successMock.mock.callCount(), 0);
  assert.equal(failureMock.mock.callCount(), 1);
  assert.deepEqual(failureMock.mock.calls[0]?.arguments, [error]);
});

test('fold unknown', () => {
  const { view } = foldMocks();

  // @ts-expect-error not a RemoteData state
  assert.throws(() => view(mock.fn()), /Unknown RemoteData state:/);
});
