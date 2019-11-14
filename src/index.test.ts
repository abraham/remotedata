import { Failure, fold, Initialized, Kinds, Pending, Success } from "./index";

test("Kinds", () => {
  expect(Kinds).toEqual({
    Failure: "Failure",
    Initialized: "Initialized",
    Pending: "Pending",
    Success: "Success",
    _: "_"
  });
});

test("Initialized", () => {
  expect(new Initialized()).toBeInstanceOf(Initialized);
  expect(new Initialized().kind).toEqual("Initialized");
});

test("Pending", () => {
  expect(new Pending()).toBeInstanceOf(Pending);
  expect(new Pending().kind).toEqual("Pending");
});

test("Success", () => {
  const data = { apple: "sauce" };
  const state = new Success(data);
  expect(state).toBeInstanceOf(Success);
  expect(state.kind).toEqual("Success");
  expect(state.data).toEqual(data);
});

test("Success without data", () => {
  expect(() => new Success()).toThrowError('Parameter "data" is required');
});

test("Failure", () => {
  const error = 500;
  const state = new Failure(error);
  expect(state).toBeInstanceOf(Failure);
  expect(state.kind).toEqual("Failure");
  expect(state.error).toEqual(error);
});

test("Failure without error", () => {
  expect(() => new Failure()).toThrowError('Parameter "error" is required');
});

test("fold initialized", () => {
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const view = fold(initializedMock, pendingMock, failureMock, successMock);

  view(new Initialized());
  expect(initializedMock).toHaveBeenCalledTimes(1);
  expect(initializedMock).toHaveBeenCalledWith();
  expect(pendingMock).not.toHaveBeenCalled();
  expect(successMock).not.toHaveBeenCalled();
  expect(failureMock).not.toHaveBeenCalled();
});

test("fold pending", () => {
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const view = fold(initializedMock, pendingMock, failureMock, successMock);

  view(new Pending());
  expect(initializedMock).not.toHaveBeenCalled();
  expect(pendingMock).toHaveBeenCalledTimes(1);
  expect(pendingMock).toHaveBeenCalledWith();
  expect(successMock).not.toHaveBeenCalled();
  expect(failureMock).not.toHaveBeenCalled();
});

test("fold success", () => {
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const view = fold(initializedMock, pendingMock, failureMock, successMock);

  const data = { apple: "sauce" };
  view(new Success(data));
  expect(initializedMock).not.toHaveBeenCalled();
  expect(pendingMock).not.toHaveBeenCalled();
  expect(successMock).toHaveBeenCalledTimes(1);
  expect(successMock).toHaveBeenCalledWith(data);
  expect(failureMock).not.toHaveBeenCalled();
});

test("fold failure", () => {
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const view = fold(initializedMock, pendingMock, failureMock, successMock);

  const error = 500;
  view(new Failure(error));
  expect(initializedMock).not.toHaveBeenCalled();
  expect(pendingMock).not.toHaveBeenCalled();
  expect(successMock).not.toHaveBeenCalled();
  expect(failureMock).toHaveBeenCalledTimes(1);
  expect(failureMock).toHaveBeenCalledWith(error);
});

test("fold unknown", () => {
  const otherMock = jest.fn();
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const view = fold(initializedMock, pendingMock, failureMock, successMock);

  expect(() => view(otherMock)).toThrowError("Unknown RemoteData state:");
});

test("match initialized", () => {
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const _Mock = jest.fn();

  new Initialized().match({
    Initialized: initializedMock,
    Pending: pendingMock,
    Success: successMock,
    Failure: failureMock,
    _: _Mock
  });
  expect(initializedMock).toHaveBeenCalledTimes(1);
  expect(initializedMock).toHaveBeenCalledWith();
  expect(pendingMock).not.toHaveBeenCalled();
  expect(successMock).not.toHaveBeenCalled();
  expect(failureMock).not.toHaveBeenCalled();
  expect(_Mock).not.toHaveBeenCalled();
});

test("match pending", () => {
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const _Mock = jest.fn();

  new Pending().match({
    Initialized: initializedMock,
    Pending: pendingMock,
    Success: successMock,
    Failure: failureMock,
    _: _Mock
  });
  expect(initializedMock).not.toHaveBeenCalled();
  expect(pendingMock).toHaveBeenCalledTimes(1);
  expect(pendingMock).toHaveBeenCalledWith();
  expect(successMock).not.toHaveBeenCalled();
  expect(failureMock).not.toHaveBeenCalled();
  expect(_Mock).not.toHaveBeenCalled();
});

test("match success", () => {
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const _Mock = jest.fn();

  const data = { apple: "sauce" };
  new Success(data).match({
    Initialized: initializedMock,
    Pending: pendingMock,
    Success: successMock,
    Failure: failureMock,
    _: _Mock
  });
  expect(initializedMock).not.toHaveBeenCalled();
  expect(pendingMock).not.toHaveBeenCalled();
  expect(successMock).toHaveBeenCalledTimes(1);
  expect(successMock).toHaveBeenCalledWith(data);
  expect(failureMock).not.toHaveBeenCalled();
  expect(_Mock).not.toHaveBeenCalled();
});

test("match failure", () => {
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const _Mock = jest.fn();

  const error = 500;
  new Failure(error).match({
    Initialized: initializedMock,
    Pending: pendingMock,
    Success: successMock,
    Failure: failureMock,
    _: _Mock
  });
  expect(initializedMock).not.toHaveBeenCalled();
  expect(pendingMock).not.toHaveBeenCalled();
  expect(successMock).not.toHaveBeenCalled();
  expect(failureMock).toHaveBeenCalledTimes(1);
  expect(failureMock).toHaveBeenCalledWith(error);
  expect(_Mock).not.toHaveBeenCalled();
});

test("match _ with Initialized", () => {
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const _Mock = jest.fn();

  new Initialized().match({
    _: _Mock
  });
  new Initialized().match({
    Initialized: initializedMock,
    _: _Mock
  });
  new Initialized().match({
    Initialized: initializedMock,
    Pending: pendingMock,
    Success: successMock,
    Failure: failureMock,
    _: _Mock
  });
  expect(initializedMock).toHaveBeenCalledTimes(2);
  expect(pendingMock).not.toHaveBeenCalled();
  expect(successMock).not.toHaveBeenCalled();
  expect(failureMock).not.toHaveBeenCalled();
  expect(_Mock).toHaveBeenCalledTimes(1);
});

test("match _ with Pending", () => {
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const _Mock = jest.fn();

  new Pending().match({
    _: _Mock
  });
  new Pending().match({
    Pending: pendingMock,
    _: _Mock
  });
  new Pending().match({
    Initialized: initializedMock,
    Pending: pendingMock,
    Success: successMock,
    Failure: failureMock,
    _: _Mock
  });
  expect(initializedMock).not.toHaveBeenCalled();
  expect(pendingMock).toHaveBeenCalledTimes(2);
  expect(successMock).not.toHaveBeenCalled();
  expect(failureMock).not.toHaveBeenCalled();
  expect(_Mock).toHaveBeenCalledTimes(1);
});

test("match _ with Success", () => {
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const _Mock = jest.fn();

  const data = { apple: "sauce" };
  new Success(data).match({
    _: _Mock
  });
  new Success(data).match({
    Success: successMock,
    _: _Mock
  });
  new Success(data).match({
    Initialized: initializedMock,
    Pending: pendingMock,
    Success: successMock,
    Failure: failureMock,
    _: _Mock
  });
  expect(initializedMock).not.toHaveBeenCalled();
  expect(pendingMock).not.toHaveBeenCalled();
  expect(successMock).toHaveBeenCalledTimes(2);
  expect(successMock).toHaveBeenNthCalledWith(1, data);
  expect(successMock).toHaveBeenNthCalledWith(2, data);
  expect(failureMock).not.toHaveBeenCalled();
  expect(_Mock).toHaveBeenCalledTimes(1);
});

test("match _ with Failure", () => {
  const initializedMock = jest.fn();
  const pendingMock = jest.fn();
  const successMock = jest.fn();
  const failureMock = jest.fn();
  const _Mock = jest.fn();

  const error = 500;
  new Failure(error).match({
    _: _Mock
  });
  new Failure(error).match({
    Failure: failureMock,
    _: _Mock
  });
  new Failure(error).match({
    Initialized: initializedMock,
    Pending: pendingMock,
    Success: successMock,
    Failure: failureMock,
    _: _Mock
  });
  expect(initializedMock).not.toHaveBeenCalled();
  expect(pendingMock).not.toHaveBeenCalled();
  expect(successMock).not.toHaveBeenCalled();
  expect(failureMock).toHaveBeenCalledTimes(2);
  expect(failureMock).toHaveBeenNthCalledWith(1, error);
  expect(failureMock).toHaveBeenNthCalledWith(2, error);
  expect(_Mock).toHaveBeenCalledTimes(1);
});
