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

/** Transforms Success data; other states pass through unchanged. */
export function map<E, D, R>(
  state: RemoteData<E, D>,
  fn: (data: D) => R,
): RemoteData<E, R> {
  return state.kind === Kinds.Success ? new Success(fn(state.data)) : state;
}

/** Transforms a Failure error; other states pass through unchanged. */
export function mapError<E, D, R>(
  state: RemoteData<E, D>,
  fn: (error: E) => R,
): RemoteData<R, D> {
  return state.kind === Kinds.Failure ? new Failure(fn(state.error)) : state;
}

/** Chains a Success into another RemoteData; other states pass through unchanged. */
export function andThen<E, D, F, R>(
  state: RemoteData<E, D>,
  fn: (data: D) => RemoteData<F, R>,
): RemoteData<E | F, R> {
  return state.kind === Kinds.Success ? fn(state.data) : state;
}

/** Returns Success data, or `fallback` for any other state. */
export function withDefault<D>(state: RemoteData<unknown, D>, fallback: D): D {
  return state.kind === Kinds.Success ? state.data : fallback;
}

type SuccessData<T> = T extends Success<infer D> ? D : never;
type FailureError<T> = T extends Failure<infer E> ? E : never;

/**
 * Combines states into one: the first Failure, else Pending if any are pending,
 * else Initialized if any are, else Success with every value in order.
 */
export function combine<T extends readonly RemoteData[]>(
  states: [...T],
): RemoteData<FailureError<T[number]>, { [K in keyof T]: SuccessData<T[K]> }> {
  const failure = states.find((state) => isFailure(state));
  if (failure) {
    return failure as Failure<FailureError<T[number]>>;
  }
  if (states.some((state) => isPending(state))) {
    return new Pending();
  }
  if (states.some((state) => isInitialized(state))) {
    return new Initialized();
  }
  const data = states.map((state) => (state as Success).data);
  return new Success(data as { [K in keyof T]: SuccessData<T[K]> });
}

/** Resolves to Success with the promise's value, or Failure with its rejection reason. */
export async function fromPromise<D>(
  promise: PromiseLike<D>,
): Promise<Failure | Success<D>> {
  try {
    return new Success(await promise);
  } catch (error) {
    return new Failure(error);
  }
}
