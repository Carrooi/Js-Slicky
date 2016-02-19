[![NPM version](https://img.shields.io/npm/v/slicky.svg?style=flat-square)](https://www.npmjs.com/package/slicky)
[![Dependency Status](https://img.shields.io/gemnasium/Carrooi/Js-Slicky.svg?style=flat-square)](https://gemnasium.com/Carrooi/Js-Slicky)
[![Build Status](https://img.shields.io/travis/Carrooi/Js-Slicky.svg?style=flat-square)](https://travis-ci.org/Carrooi/Js-Slicky)

[![Donate](https://img.shields.io/badge/donate-PayPal-brightgreen.svg?style=flat-square)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=ARUCDRF95XRBA)

# Slicky

Light JS framework combining features of angular 2 and spine.js together.

### The problem of mine...

I have some really large application written in PHP and we definitely don't plan changing whole application into 
SPA. But the thing is that we need some JS, because 21st century right? And yes, it's also good for our users.

Currently we are using angular 1, but the problem is that it's really overcomplicated. If you don't know what I mean, 
please watch this [video](https://www.youtube.com/watch?v=-dMBcqwvYA0) from ng-conf 2015 where Misko Hevery and Rado 
Kirov explained syntax and differences between angular 1 and angular 2.

So after trying angular 2 on one test project for a month, I really wanted to try it on our website also. Problem is 
that I can't... Angular 2 basically [works](https://github.com/angular/angular/issues/6194#issuecomment-172926749) 
just with SPA websites. Hmm... What now? I can stick with angular 1, but I can't really say that I'm 100% sure about 
the code I write. Or use something like [backbone](http://backbonejs.org/) (too old) or eg. 
[spine.js](http://spinejs.com/) which we used before angular 1 (I don't like CoffeScript anymore). 

That's why I created yet another JS framework.

### When to use it

* When you have large server side application
* When you think angular 2 is really awesome
* When you want something really simple
* When you want to use typescript
* When you want add some JS behavior to existing site
* When you don't need jquery

### When not use it

* When you want single page application (just go with angular 2)
* When you want just some jquery

## Installation

```
$ npm install slicky
$ npm install es7-reflect-metadata
```

## Bootstrap

For bootstraping a new application you have to create some main file, like `bootstrap.ts`:

```ts
import 'es7-reflect-metadata/dist/browser';

import {Application} from 'slicky/core';
import {Container} from 'slicky/di';

let container = new Container;

let app = new Application(container);

app.run();
```

## Controllers

Now we can create some first controller.

Controllers are classes which are adding some JS behavior to existing html elements.

```html
<div super-cool-counter>
	<span>0</span>
	<a href="#">Add number!</a>
</div>
```

```ts
import {Component, Element, Event} from 'slicky/core';

@Component({
	selector: '[super-cool-counter]',
})
export class Counter
{

	@Element('span')
	private counterSpan: HTMLSpanElement;
	
	@Event('a', 'click')
	public onAddButtonClick(e: Event): void
	{
		e.preventDefault();
		
		this.counterSpan.innerText = parseInt(this.counterSpan.innerText) + 1;
	}

}
```

As you can see there are no templates and no data binding (at least for now). Instead we have access to elements inside 
of our component and we can also attach events there. This idea comes from [spine.js](http://spinejs.com/).

**`selector` option in `@Component` can be any valid CSS DOM query.** 

Now you just need to register this component in `bootstrap.js`:

```ts
import {Counter} from './app/components/Counter';

// ...

let app = new Application(container);

app.registerController(Counter);

app.run();
```

### onInit subscriber

If your component has `onInit` method, slicky will call it immediately after initializing whole component. 

```ts
import {Component} from 'slicky/core';

@Component({
	selector: '[app-component]',
})
export class Counter
{

	public onInit(): void
	{
		console.log('counter initialized and ready :-)');
	}

}
```

### Element annotation

`@Element` annotation tels slicky that you want to have access to some element inside of component. This can be any 
valid css selector. 

If you omit the selector, you'll get access to component's element itself.

```html
<div app-component>
	<span></span>
</div>
```

```ts
import {Component, Element} from 'slicky/core';

@Component({
	selector: '[app-component]',
})
export class Counter
{

	@Element()
	private el: HTMLDivElement;

	@Element('span')
	private span: HTMLSpanElement;
	
	public onInit(): void
	{
		this.el.style.backgroundColor = 'red';
		this.span.innerText = 'hello in red <div>';
	}

}
```

### Event annotation

With `@Event` annotation you can attach some methods to DOM events like `click`, `mouseover` and so on.

```ts
import {Component, Event} from 'slicky/core';

@Component({
	selector: '[app-component]',
})
export class Counter
{

	@Element('a.save')
	private saveButton: HTMLLinkElement;

	@Event('mouseover')
	public onHover(): void
	{
		console.log('hovered over component\'s area');
	}

	@Event('.footer a.btn', 'click')
	public onButtonClick(e: Event): void
	{
		console.log('clicked on a with .btn class');
	}
	
	@Event('@saveButton', 'click')		// same as 'a.save' in this case
	public onSaveButtonClick(): void
	{
		console.log('clicked on @saveButton element');
	}
	
	@Event(document, 'click')
	public onDocumentClick(): void
	{
		console.log('clicked onto document');
	}
	
	@Event(window, 'scroll')
	public onWindowScroll(): void
	{
		console.log('scrolling with window');
	}

}
```

### Input annotation

Inputs in slicky are similar to inputs in angular 2. You can use `@Input` annotation for accepting some attribute from 
outside of your component.

```html
<div article article-id="5">
	lorem ipsum dolor sit amet
</div>
```

```ts
import {Component, Input} from 'slicky/core';

@Component({
	selector: '[article]',
})
export class Counter
{

	@Input('article-id')
	private id: number;

}
```

Now you'll find `5` in `id` property. If you provide type of property, slicky will automatically try to transform 
value of property into needed type. In this case into `integer`. Supported types are `number`, `string` and `boolean`.

## Dependency injection

Of course you can create some services (like model classes) and let our DI container pass them automatically to your 
controllers.

You only need to mark your services with `@Injectable()` annotation. Otherwise other services will not be injected into 
them.

### Services

`Users.ts`:

```ts
import {Injectable} from 'slicky/di';

@Injectable()
export class Users
{

	public getUsers(fn: (users: Array<any>) => void): void
	{
		// ...
	}

}
```

`bootstrap.ts`:

```ts
// ...

import {Users} from './app/Users';

let container = new Container;

container.provide(Users);

// ...
```

`UserController.ts`:

```ts
import {Component} from 'slicky/core';
import {Users} from '../../Users';

export class UserController
{
	
	private users: Users;
	
	constructor(users: Users)
	{
		this.users = users;
	}
	
}
```

### Factories

```ts
container.provide(Users, {
	useFactory: () => {
		return new Users;
	}
});
```
