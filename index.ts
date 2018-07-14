export type RemoteData<D, E> = Initialized | Pending | Success<D> | Failure<E>;

export class Initialized {}

export class Pending {}

export class Success<D> {
  constructor(public data: D) {}
}

export class Failure<E> {
  constructor(public error: E) {}
}

export function fold<T, D, E>(
  initialized: () => T,
  pending: () => T,
  success: (data: D) => T,
  failure: (error: E) => T,
): (state: RemoteData<E, D>) => T {
  return (state: RemoteData<D, E>) => {
    if (state instanceof Initialized) {
      return initialized();
    } else if (state instanceof Pending) {
      return pending();
    } else if (state instanceof Success) {
      return success(state.data);
    } else if (state instanceof Failure) {
      return failure(state.error);
    } else {
      return fail('All RemoteData states not handled.');
    }
  }
}

function fail(error: string): never {
  throw new Error(error);
}
