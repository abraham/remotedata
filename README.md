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

```ts
import { Failure, fold, Initialized, Pending, RemoteData, Success } from '@abraham/remotedata';
import { Status } from 'twitter-d';
import { api } from './api';

// Define what the RemoteData Success and Failure types will be.
type State = RemoteData<Status, number>;

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
    const { data, status_code} = await api.getStatus();
    if (status_code === 200) {
      // If the request succeeds set the state to Success with the returned data.
      this.state = new Success(data);
    } else {
      // If the request does not succeed set the state to Failure with the reason.
      this.state = new Failure(status_code);
    }
    // Render the new state.
    this.render();
  }

  private get view(state: State): string {
    // Use `fold` to easily define logic based on the state.
    return fold<TemplateResult, Status, number>(
      // What to do if the state is Initialized.
      () => 'Initialized',
      // What to do if the request is Pending.
      () => 'Loading...',
      // What to do if the request succeeds.
      (status: Status) => `Got tweet from ${status.screen_name}`,
      // What to do if the request fails.
      (error: string) => `Error: ${error}`,
    );
  }

  private render(): string {
    // Render the current state in your UI.
    const text: string = this.view(this.state);
    // Maybe put it in a template.
  }
}
```
