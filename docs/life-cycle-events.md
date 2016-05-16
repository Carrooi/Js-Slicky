## Life cycle events

[Directives](./directives.md) and [components](./components.md) can listen for 
some changes in application related to them.

```ts
import {Component, OnInit, OnDestroy, OnChange, OnUpdate} from 'slicky/core';

@Component({
	selector: '[app]',
})
export class App implements OnInit, OnDestroy, OnChange, OnUpdate
{

	public onInit(): void {}
	
	public onDestroy(): void {}
	
	public onChange(inputName: string, changed): void {}
	
	public onUpdate(inputName: string, value: any): void {}

}
```

### OnInit

Called when directive with all of it's bindings (inputs, events and elements) 
are ready and connected.

### OnDestroy

Called when directive is detached from DOM.

### OnChange

Called when change in some [view](./view.md) property occur. This event is 
called before directive's input is updated and even before the input's 
expression is parsed. It can also disable those steps by returning `false`.
  
### OnUpdate

Called when directive's input's expression is parsed and the input is updated.
