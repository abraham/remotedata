export type RemoteData<D, E> = Initialized | Pending | Success<D> | Failure<E>;

export class Initialized {
  private kind = 'Initialized';
}

export class Pending {
  private kind = 'Pending';
}

export class Success<D> {
  private kind = 'Success';

  constructor(public data: D) {
    if (data === null || data === undefined) {
      fail('Parameter "data" is required');
    }
  }
}

export class Failure<E> {
  private kind = 'Failure';

  constructor(public error: E) {
    if (error === null || error === undefined) {
      fail('Parameter "error" is required');
    }
  }
}

export function fold<T, D, E>(
  initialized: () => T,
  pending: () => T,
  success: (data: D) => T,
  failure: (error: E) => T,
): (state: RemoteData<D, E>) => T {
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
      return fail('Unknown RemoteData type used');
    }
  }
}

function fail(error: string): never {
  throw new Error(error);
}
