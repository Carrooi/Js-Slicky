# Directives

Just like in angular 2, directives are classes which adds some behaviors to your 
HTML elements.

```ts
import {Directive, ElementRef, OnInit} from 'slicky/core';

@Directive({
	selector: '[red]',
})
export class RedColorDirective implements OnInit
{

	private elementRef: ElementRef;
	
	constructor(elementRef: ElementRef)
	{
		this.elementRef = elementRef;
	}

	public onInit(): void
	{
		this.elementRef.nativeEl.style.color = 'red';
	}

}
```

```html
<div red>soon to be red text</div>
```

In this simple directive we are just changing element's color to `red`.

We are also using `onInit` life cycle event, you can read more about them 
[here](./life_cycle_events.md).

## Inputs

Directive can also receive some input from it's element via attributes.

We can change our previous directive to work with any color, not just `red`.

```ts
import {Directive, ElementRef, Input, OnInit} from 'slicky/core';

@Directive({
	selector: '[color]',
})
export class AnyColorDirective implements OnInit
{

	private elementRef: ElementRef;
	
	@Input('color')
	public color: string;
	
	constructor(elementRef: ElementRef)
	{
		this.elementRef = elementRef;
	}

	public onInit(): void
	{
		this.elementRef.nativeEl.style.color = this.color;
	}

}
```

```html
<div color="blue">Soon to be blue text</div>
```

`@Input` parameter (in our example `color`) is the name of attribute we want to 
have access to. It's not actually mandatory if name of element's attribute is 
same as directive's input.

## Events

Creating DOM events subscribers can be done with `@HostEvent` annotation. 

```ts
import {Directive, ElementRef, HostEvent} from 'slicky/core';

@Directive({
	selector: 'a[confirm]',
})
export class ConfirmationLink implements OnInit
{

	private elementRef: ElementRef;
	
	constructor(elementRef: ElementRef)
	{
		this.elementRef = elementRef;
	}

	@HostEvent('click')
	public onClick(e: Event): void
	{
		e.preventDefault();
		
		if (window.confirm('Are you sure?')) {
			window.location.href = this.elementRef.nativeEl.href;
		}
	}

}
```

```html
<a href="/delete.php" confirm>Delete!</a>
```

Slicky also allows you to attach subscriber to element's children just by 
changing the `@HostEvent` annotation slightly.

```ts
@HostEvent('a.child-selector', 'click')
public onChildClick(e: Event): void
{
}
```

## Export into parent template

Directives (and [components](./components.md)) could be exported into parent template. This is useful
when you want to have access to child directive from parent.

```ts
@Directive({
	selector: 'directive',
	exportAs: 'dir',
})
export class TestDirective
{

	public text: string = 'lorem ipsum';

}
```

```html
<directive #d="dir"></directive>
<code>{{ d.text }}</code>
```

Output will be `lorem ipsum`.

## Build in directives

See in [templates](./templates.md).
