[![Version Status](https://img.shields.io/npm/v/@abraham/remotedata.svg?style=flat&label=version&colorB=4bc524)](https://npmjs.com/package/@abraham/remotedata)
[![Build Status](https://github.com/abraham/remotedata/workflows/Index/badge.svg)](https://github.com/abraham/remotedata/actions)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@abraham/remotedata.svg?style=flat&colorB=4bc524)](https://bundlephobia.com/result?p=@abraham/remotedata)

# RemoteData

Lightweight TypeScript RemoteData implementation

## Install

```sh
npm install @abraham/remotedata
```

## Usage

Read [Slaying a UI Antipattern with Web Components (and TypeScript)](https://bendyworks.com/blog/slaying-a-ui-antipattern-with-web-components-and-typescript) for a more thorough guide.

This is an example class that gets a post (type `Post`) from a remote HTTP API.

```ts
import {
  Failure,
  fold,
  Initialized,
  Pending,
  Success,
  type RemoteData,
} from '@abraham/remotedata';

interface Post {
  title: string;
}

// Define what the RemoteData Failure and Success types will be.
type State = RemoteData<number, Post>;

class Thing {
  // Set the initial state as Initialized.
  private state: State = new Initialized();

  // Use `fold` to easily define logic based on the current state.
  // Fold takes four methods as parameters in the order of Initialized, Pending, Failure, and
  // Success and returns a method that takes a `RemoteData` state instance as a parameter. When
  // the returned method gets called with a `RemoteData` state, the method matching the correct
  // state gets called.
  private view = fold<string, number, Post>(
    // What to do if the state is Initialized.
    () => 'Initialized',
    // What to do if the request is Pending.
    () => 'Loading...',
    // What to do if the request fails.
    (error) => `Error: ${error}`,
    // What to do if the request succeeds.
    (post) => `Got post ${post.title}`,
  );

  constructor() {
    // On instantiation start the remote call and render the current state.
    void this.getPost();
    this.render();
  }

  private async getPost(): Promise<void> {
    // Before starting the remote call set the current state to Pending.
    this.state = new Pending();
    // Perform the actual remote request.
    const response = await fetch('https://api.example.com/post');
    if (response.ok) {
      // If the request succeeds set the state to Success with the returned data.
      const post = (await response.json()) as Post;
      this.state = new Success(post);
    } else {
      // If the request does not succeed set the state to Failure with the reason.
      this.state = new Failure(response.status);
    }
    // Render the new state.
    this.render();
  }

  private render(): void {
    // Render the current state in your UI.
    // `this.view` is executed with the current state as a parameter.
    const text = this.view(this.state);
    // Maybe put it in a template.
  }
}
```

Using included [type guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates).

```ts
import { isSuccess, type RemoteData } from '@abraham/remotedata';
import { getState, type Post } from './state';

// Define what the RemoteData Failure and Success types will be.
type State = RemoteData<number, Post>;

const state: State = getState();
if (isSuccess(state)) {
  // state is known to be of type Success<Post>
  console.log(state.data.title);
}
```

## Helpers

```ts
import {
  andThen,
  combine,
  fromPromise,
  map,
  mapError,
  withDefault,
} from '@abraham/remotedata';

// Success or Failure from a promise.
const post = await fromPromise(fetchPost());
// Transform Success data or the Failure error; other states pass through.
const title = map(post, (p) => p.title);
const message = mapError(post, (error) => String(error));
// Chain into another RemoteData when Success.
const author = andThen(post, (p) => getAuthor(p.authorId));
// Success data or a fallback.
const text = withDefault(title, 'Untitled');
// First Failure, else Pending, else Initialized, else Success with all values.
const both = combine([post, author]);
```

# References

- [How Elm Slays a UI Antipattern](http://blog.jenkster.com/2016/06/how-elm-slays-a-ui-antipattern.html)
- [Slaying a UI Antipattern with Angular](https://medium.com/@joanllenas/slaying-a-ui-antipattern-with-angular-4c7536fafc54)
- [Slaying a UI Antipattern with Flow](https://medium.com/@gcanti/slaying-a-ui-antipattern-with-flow-5eed0cfb627b)
- [Slaying a UI Antipattern in React](https://medium.com/javascript-inside/slaying-a-ui-antipattern-in-react-64a3b98242c)
- [Slaying a UI Antipattern in Fantasyland](https://medium.com/javascript-inside/slaying-a-ui-antipattern-in-fantasyland-907cbc322d2a)
- [Remote Data State as an Enum](http://holko.pl/2016/06/09/data-state-as-an-enum/)
