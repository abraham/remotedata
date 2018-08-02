[![Version Status](https://img.shields.io/npm/v/@abraham/remotedata.svg?style=flat&label=version&colorB=4bc524)](https://npmjs.com/package/@abraham/remotedata)
[![Build Status](https://img.shields.io/travis/abraham/remotedata.svg?style=flat)](https://travis-ci.org/abraham/remotedata)
[![Dependency Status](https://david-dm.org/abraham/remotedata.svg?style=flat)](https://david-dm.org/abraham/remotedata)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@abraham/remotedata.svg?style=flat&colorB=4bc524)](https://bundlephobia.com/result?p=@abraham/remotedata)

RemoteData
====

Lightweight TypeScript RemoteData implementation

Install
----

```sh
npm install @abraham/remotedata
```

Usage
-----

Read [Slaying a UI Antipattern with Web Components (and TypeScript)](https://bendyworks.com/blog/slaying-a-ui-antipattern-with-web-components-and-typescript) for a more thorugh guide.

This is an example class that gets a tweet (type `Status`) from a remote HTTP API.

```ts
import { Failure, fold, Initialized, Pending, RemoteData, Success } from '@abraham/remotedata';
import { Status } from 'twitter-d';

// Define what the RemoteData Failure and Success types will be.
type State = RemoteData<number, Status>;

class Thing {
  // Set the initial state as Initialized.
  private state: State = new Initialized();

  constructor() {
    // On instantiation start the remote call and render the current state.
    this.getStatus();
    this.render();
  }

  private async function getStatus() {
    // Before starting the remote call set the current state to Pending.
    this.state = new Pending();
    // Perform the actual remote request.
    const response = await fetch('https://api.example.com/tweet');
    if (response.ok) {
      // If the request succeeds set the state to Success with the returned data.
      const status: Status = await response.json();
      this.state = new Success(status);
    } else {
      // If the request does not succeed set the state to Failure with the reason.
      this.state = new Failure(status_code);
    }
    // Render the new state.
    this.render();
  }

  private get view(state: State): (state: State) => string {
    // Use `fold` to easily define logic based on the current state.
    // Fold takes four methods as parameters in the order of Initialized, Pending, Failure, and
    // Success and returns a method that takes a `RemoteData` state instance as a parameter. When
    // the returned method gets called with a `RemoteData` state, the method matching the correct
    // state gets called.
    return fold<string, number, Status>(
      // What to do if the state is Initialized.
      () => 'Initialized',
      // What to do if the request is Pending.
      () => 'Loading...',
      // What to do if the request fails.
      (error: number) => `Error: ${error}`,
      // What to do if the request succeeds.
      (status: Status) => `Got tweet from ${status.screen_name}`,
    );
  }

  private render(): string {
    // Render the current state in your UI.
    // `this.view` returns a method which is executed with the current state as a parameter.
    const text: string = this.view(this.state);
    // Maybe put it in a template.
  }
}
```

References
====

- [How Elm Slays a UI Antipattern](http://blog.jenkster.com/2016/06/how-elm-slays-a-ui-antipattern.html)
- [Slaying a UI Antipattern with Angular](https://medium.com/@joanllenas/slaying-a-ui-antipattern-with-angular-4c7536fafc54)
- [Slaying a UI Antipattern with Flow](https://medium.com/@gcanti/slaying-a-ui-antipattern-with-flow-5eed0cfb627b)
- [Slaying a UI Antipattern in React](https://medium.com/javascript-inside/slaying-a-ui-antipattern-in-react-64a3b98242c)
- [Slaying a UI Antipattern in Fantasyland](https://medium.com/javascript-inside/slaying-a-ui-antipattern-in-fantasyland-907cbc322d2a)
- [Remote Data State as an Enum](http://holko.pl/2016/06/09/data-state-as-an-enum/)
