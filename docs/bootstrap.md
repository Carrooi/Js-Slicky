# Bootstrap

For bootstraping a new application you have to create some main file, like 
`bootstrap.ts`.

Also slicky needs some root [component](./components.md), in this case 
`AppComponent`.

```ts
import 'es7-reflect-metadata/dist/browser';

import {Application} from 'slicky/core';
import {Container} from 'slicky/di';

import {AppComponent} from './components/AppComponent';

let container = new Container;
let app = new Application(container);

app.run(AppComponent);
```
