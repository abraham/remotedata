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

type State = RemoteData<Status, number>;

class Thing {
  private state: State = new Initialized();

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

  private get view(state: State): string {
    return fold<TemplateResult, Status, number>(
      () => 'Initialized',
      () => 'Loading...',
      (status: Status) => `Got tweet from ${status.screen_name}`,
      (error: string) => `Error: ${error}`,
    );
  }

  private render(): string {
    return this.view(this.state);
  }
}
```
