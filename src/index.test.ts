import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import {
  andThen,
  combine,
  Failure,
  fold,
  fromPromise,
  Initialized,
  isFailure,
  isInitialized,
  isPending,
  isSuccess,
  Kinds,
  map,
  mapError,
  Pending,
  Success,
  withDefault,
  type RemoteData,
} from './index.ts';

function foldMocks() {
  const initializedMock = mock.fn();
  const pendingMock = mock.fn();
  const successMock = mock.fn();
  const failureMock = mock.fn();
  const view = fold(initializedMock, pendingMock, failureMock, successMock);
  return { initializedMock, pendingMock, successMock, failureMock, view };
}

test('Kinds', () => {
  assert.deepEqual(Kinds, {
    Failure: 'Failure',
    Initialized: 'Initialized',
    Pending: 'Pending',
    Success: 'Success',
  });
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

test('Success with empty data', () => {
  assert.equal(new Success(undefined).data, undefined);
  assert.equal(new Success(null).data, null);
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

test('Failure with empty error', () => {
  assert.equal(new Failure(undefined).error, undefined);
  assert.equal(new Failure(null).error, null);
});

test('type guards match plain objects by kind', () => {
  assert.ok(isInitialized({ kind: 'Initialized' }));
  assert.ok(isPending({ kind: 'Pending' }));
  assert.ok(isFailure({ kind: 'Failure', error: 500 }));
  assert.ok(isSuccess({ kind: 'Success', data: 1 }));
  assert.ok(!isSuccess(null));
  assert.ok(!isSuccess('Success'));
  assert.ok(!isSuccess({}));
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
  const other = { kind: 'Other' } as unknown as Initialized;

  assert.throws(() => view(other), /Unknown RemoteData state: Other/);
});

const initialized: RemoteData<string, number> = new Initialized();
const pending: RemoteData<string, number> = new Pending();
const failure: RemoteData<string, number> = new Failure('oops');
const success: RemoteData<string, number> = new Success(2);

test('map', () => {
  const double = (n: number) => n * 2;
  assert.deepEqual(map(success, double), new Success(4));
  assert.equal(map(failure, double), failure);
  assert.equal(map(pending, double), pending);
  assert.equal(map(initialized, double), initialized);
});

test('mapError', () => {
  const upper = (s: string) => s.toUpperCase();
  assert.deepEqual(mapError(failure, upper), new Failure('OOPS'));
  assert.equal(mapError(success, upper), success);
  assert.equal(mapError(pending, upper), pending);
  assert.equal(mapError(initialized, upper), initialized);
});

test('andThen', () => {
  const half = (n: number): RemoteData<string, number> =>
    n % 2 === 0 ? new Success(n / 2) : new Failure('odd');
  assert.deepEqual(andThen(success, half), new Success(1));
  assert.deepEqual(andThen(new Success(3), half), new Failure('odd'));
  assert.equal(andThen(failure, half), failure);
  assert.equal(andThen(pending, half), pending);
  assert.equal(andThen(initialized, half), initialized);
});

test('withDefault', () => {
  assert.equal(withDefault(success, 0), 2);
  assert.equal(withDefault(failure, 0), 0);
  assert.equal(withDefault(pending, 0), 0);
  assert.equal(withDefault(initialized, 0), 0);
});

test('combine', () => {
  const text: RemoteData<string, string> = new Success('a');
  const both = combine([success, text]);
  assert.deepEqual(both, new Success([2, 'a']));
  if (isSuccess(both)) {
    const [n, s]: [number, string] = both.data;
    assert.equal(n + s.length, 3);
  }
  assert.deepEqual(combine([]), new Success([]));
  assert.equal(combine([success, failure, pending]), failure);
  assert.deepEqual(combine([success, initialized, pending]), new Pending());
  assert.deepEqual(combine([success, initialized]), new Initialized());
});

test('fromPromise', async () => {
  assert.deepEqual(await fromPromise(Promise.resolve(1)), new Success(1));
  const error = new Error('nope');
  assert.deepEqual(
    await fromPromise(Promise.reject(error)),
    new Failure(error),
  );
});
