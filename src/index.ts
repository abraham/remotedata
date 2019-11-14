export type RemoteData<E, D> = Initialized | Pending | Failure<E> | Success<D>;

export enum Kinds {
  Initialized = 'Initialized',
  Pending = 'Pending',
  Failure = 'Failure',
  Success = 'Success',
  _ = '_'
}

type CompleteDataMatcher<T, E, D> = {
  kind: 'complete';
  [Kinds.Initialized]: () => T;
  [Kinds.Pending]: () => T;
  [Kinds.Failure]: (error: E) => T;
  [Kinds.Success]: (data: D) => T;
};

type PartialDataMatcher<T, E, D> = {
  kind: 'partial';
  [Kinds.Initialized]?: () => T;
  [Kinds.Pending]?: () => T;
  [Kinds.Failure]?: (error: E) => T;
  [Kinds.Success]?: (data: D) => T;
  [Kinds._]: () => T;
};

type Matcher<T, E, D> =
  | CompleteDataMatcher<T, E, D>
  | PartialDataMatcher<T, E, D>;

function isComplete<T, E, D>(
  matcher: Matcher<T, E, D>
): matcher is CompleteDataMatcher<T, E, D> {
  return matcher.kind === 'complete';
}

function match<T, E, D>(
  matcher: Matcher<T, E, D>,
  kind: Kinds.Initialized | Kinds.Pending
): T {
  if (isComplete(matcher)) {
    let specific = matcher[kind];
    return specific();
  }
  let specific = matcher[kind];
  if (specific !== undefined) {
    return specific();
  }
  return matcher[Kinds._]();
}

export class Initialized {
  readonly kind = Kinds.Initialized;
  match<T, E, D>(matcher: Matcher<T, E, D>): T {
    return match(matcher, this.kind);
  }
}

export class Pending {
  readonly kind = Kinds.Pending;
  match<T, E, D>(matcher: Matcher<T, E, D>): T {
    return match(matcher, this.kind);
  }
}

export class Failure<E> {
  readonly kind = Kinds.Failure;

  constructor(public error: E) {
    if (error === null || error === undefined) {
      throw new TypeError('Parameter "error" is required');
    }
  }
  match<T, D>(matcher: Matcher<T, E, D>): T {
    if (isComplete(matcher)) {
      let specific = matcher[this.kind];
      return specific(this.error);
    }
    let specific = matcher[this.kind];
    if (specific !== undefined) {
      return specific(this.error);
    }
    return matcher[Kinds._]();
  }
}

export class Success<D> {
  readonly kind = Kinds.Success;

  constructor(public data: D) {
    if (data === null || data === undefined) {
      throw new TypeError('Parameter "data" is required');
    }
  }
  match<T, E>(matcher: Matcher<T, E, D>): T {
    if (isComplete(matcher)) {
      let specific = matcher[this.kind];
      return specific(this.data);
    }
    let specific = matcher[this.kind];
    if (specific !== undefined) {
      return specific(this.data);
    }
    return matcher[Kinds._]();
  }
}

export function fold<T, E, D>(
  initialized: () => T,
  pending: () => T,
  failure: (error: E) => T,
  success: (data: D) => T
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
        throw new NeverError(state);
    }
  };
}

class NeverError extends Error {
  constructor(value: never) {
    super(`Unknown RemoteData state: ${value}`);
  }
}
