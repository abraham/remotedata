RemoteData
====
Simple TypeScript RemoteData implementation

Install
----

    $ npm install @abraham/remotedata

Usage
-----

```ts
import { Failure, Initialized, Pending, RemoteData, Success } from '@abraham/remotedata';
import { Status } from 'twitter-d';
import { api } from './api';

class Thing {
  private state: RemoteData<Status, number> = new Initialized();

  constructor() {
    this.getStatus();
    this.render();
  }

  private async function getStatus() {
    this.state = new Pending();
    const { data, status_code} = api.getStatus();
    if (status_code === 200) {
      this.state = new Success(data);
    } else {
      this.state = new Failure(status_code);
    }
    this.render();
  }

  private async render() {
    if (this.state instanceof Initialized) {
      // No work is happening yet
    } else if (this.state instanceof Pending) {
      // Work is currently being done
    } else if (this.state instanceof Success) {
      // Render the successful result
    } else if (this.state instanceof Failure) {
      // Render an error message
    }
  }
}
```
