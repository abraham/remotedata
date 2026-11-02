class NeverError extends Error {
  override readonly name = 'NeverError';

  constructor(value: never) {
    super(`Unknown RemoteData state: ${String(kindOf(value))}`);
  }
}

/** The four states of a remote request: `E` is the failure type, `D` the success data type. */
export type RemoteData<E = unknown, D = unknown> =
  Initialized | Pending | Failure<E> | Success<D>;

/** The `kind` discriminant of each RemoteData state. */
export const Kinds = {
  Initialized: 'Initialized',
  Pending: 'Pending',
  Failure: 'Failure',
  Success: 'Success',
} as const;

export type Kinds = (typeof Kinds)[keyof typeof Kinds];

/** The request hasn't started. */
export class Initialized {
  readonly kind: typeof Kinds.Initialized = Kinds.Initialized;
}

/** The request is in flight. */
export class Pending {
  readonly kind: typeof Kinds.Pending = Kinds.Pending;
}

/** The request failed with `error`. */
export class Failure<E = unknown> {
  readonly kind: typeof Kinds.Failure = Kinds.Failure;
  readonly error: E;

  constructor(error: E) {
    this.error = error;
  }
}

/** The request succeeded with `data`. */
export class Success<D = unknown> {
  readonly kind: typeof Kinds.Success = Kinds.Success;
  readonly data: D;

  constructor(data: D) {
    this.data = data;
  }
}

/** Returns a function that calls the callback matching a state's kind. */
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

function kindOf(state: unknown): unknown {
  return typeof state === 'object' && state !== null && 'kind' in state
    ? state.kind
    : undefined;
}

/** Whether `state` is Initialized. */
export const isInitialized = (state: unknown): state is Initialized =>
  kindOf(state) === Kinds.Initialized;
/** Whether `state` is Pending. */
export const isPending = (state: unknown): state is Pending =>
  kindOf(state) === Kinds.Pending;
/** Whether `state` is a Failure. */
export const isFailure = <E = unknown>(state: unknown): state is Failure<E> =>
  kindOf(state) === Kinds.Failure;
/** Whether `state` is a Success. */
export const isSuccess = <D = unknown>(state: unknown): state is Success<D> =>
  kindOf(state) === Kinds.Success;
