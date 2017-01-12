# Bootstrap

First you should create typescript configuration file for your project (`tsconfig.json`).
[Here](../examples/tsconfig.json) you can find example of basic configuration.

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
let app = new Application(container, [
	AppComponent,
]);

app.run();
```
