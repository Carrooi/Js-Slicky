# ElementRef

When slicky wants to work with some element, its doing it through `ElementRef`. 
Each element can have only one `ElementRef` and is not created when it's not 
needed.

It can be used in [directives](./directives.md) to access current DOM element.

```ts
import {Component, ElementRef, OnInit} from 'slicky/core';

@Component({
	selector: '[app]',
})
class App implements OnInit
{

	private elementRef: ElementRef;

	constructor(elementRef: ElementRef)
	{
		this.elementRef = elementRef;
	}
	
	public onInit(): void
	{
		this.elementRef.nativeElement.style.border = '1px solid red';
	}

}
```
