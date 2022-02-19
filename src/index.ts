class NeverError extends Error {
  constructor(value: never) {
    super(`Unknown RemoteData state: ${value}`);
  }
}

export type RemoteData<E, D> = Initialized | Pending | Failure<E> | Success<D>;

export enum Kinds {
  Initialized = 'Initialized',
  Pending = 'Pending',
  Failure = 'Failure',
  Success = 'Success',
}

export class Initialized {
  readonly kind = Kinds.Initialized;
}

export class Pending {
  readonly kind = Kinds.Pending;
}

export class Failure<E> {
  readonly kind = Kinds.Failure;

  constructor(public error: E) {
    if (error === null || error === undefined) {
      throw new TypeError('Parameter "error" is required');
    }
  }
}

export class Success<D> {
  readonly kind = Kinds.Success;

  constructor(public data: D) {
    if (data === null || data === undefined) {
      throw new TypeError('Parameter "data" is required');
    }
  }
}

export function fold<T, E, D>(
  initialized: () => T,
  pending: () => T,
  failure: (error: E) => T,
  success: (data: D) => T,
): (state: RemoteData<E, D>) => T {
  return (state: RemoteData<E, D>): T => {
    switch (state.kind) {
      case Kinds.Initialized:
        return initialized();
      case Kinds.Pending:
        return pending();
      case Kinds.Failure:
        return failure(state.error);
      case Kinds.Success:
        return success(state.data);
      default:
        throw new NeverError(state);
    }
  };
}

export const isInitialized = (state: unknown): state is Initialized =>
  state instanceof Initialized;
export const isPending = (state: unknown): state is Pending =>
  state instanceof Pending;
export const isFailure = <E>(state: unknown): state is Failure<E> =>
  state instanceof Failure;
export const isSuccess = <D>(state: unknown): state is Success<D> =>
  state instanceof Success;
