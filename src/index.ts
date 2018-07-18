export type RemoteData<E, D> = Initialized | Pending | Failure<E> | Success<D>;

export enum Kinds {
  Initialized = 'Initialized',
  Pending = 'Pending',
  Failure = 'Failure',
  Success = 'Success',
}

export class Initialized {
  public kind: typeof Kinds.Initialized = Kinds.Initialized;
}

export class Pending {
  public kind: typeof Kinds.Pending = Kinds.Pending;
}

export class Failure<E> {
  public kind: typeof Kinds.Failure = Kinds.Failure;

  constructor(public error: E) {
    if (error === null || error === undefined) {
      fail('Parameter "error" is required');
    }
  }
}

export class Success<D> {
  public kind: typeof Kinds.Success = Kinds.Success;

  constructor(public data: D) {
    if (data === null || data === undefined) {
      fail('Parameter "data" is required');
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
        return fail('Unknown RemoteData type used');
    }
  }
}

function fail(error: string): never {
  throw new Error(error);
}
