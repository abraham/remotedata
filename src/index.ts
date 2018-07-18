export type RemoteData<E, D> = Initialized | Pending | Failure<E> | Success<D>;

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

export function fold<T, E, D>(
  initialized: () => T,
  pending: () => T,
  failure: (error: E) => T,
  success: (data: D) => T,
): (state: RemoteData<E, D>) => T {
  return (state: RemoteData<E, D>) => {
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
