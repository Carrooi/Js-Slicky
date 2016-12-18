# Communication

There are many ways how components (or directives) can talk to each other. Some are more useful for communication inside 
of templates and some for communication only within components declarations.

## Inject parent into child with @Input()

`@Required()` annotation is optional.

```ts
import {Component, Input, Required} from 'slicky/core';

@Component({
	selector: 'child',
	template: 'lorem ipsum',
})
class Child
{

	@Required()
	@Input()
	parent: Parent;

}

@Component({
	selector: 'parent',
	controllerAs: 'p',
	template: '<child [parent]="p"></child>',
	directives: [Child],
})
class Parent {}
```

```html
<parent></parent>
```

## Listen for child events with @Output()

```ts
import {Component, Output} from 'slicky/core';
import {EventEmitter} from 'slicky/utils';

@Component({
	selector: 'child',
	controllerAs: 'c',
	template: '<button (click)="c.remove()"></button>',
})
class Child
{

	@Output()
	removed = new EventEmitter<number>();
	
	remove()
	{
		this.removed.emit(5);
	}

}

@Component({
	selector: 'parent',
	controllerAs: 'p',
	template: '<child (removed)="p.removed($value)"></child>',
	directives: [Child],
})
class Parent
{

	removed(id: number)
	{
		console.log('Child component with id ' + id + ' was removed.');		// id = 5
	}

}
```

```html
<parent></parent>
```

## Export child into parent template

```ts
import {Component} from 'slicky/core';

@Component({
	selector: 'child',
	template: 'lorem ipsum',
})
class Child
{

	id = 5;

}

@Component({
	selector: 'parent',
	controllerAs: 'p',
	template: '<child #c></child>ID of child is {{ c.id }}',	// id = 5
	directives: [Child],
})
class Parent {}
```

```html
<parent></parent>
```

## Inject specific parent into child component with @ParentComponent()

If you set type of parent component inside of `@ParentComponent()` like in next example, it will not be possible to 
use component (or directive) in any other parent. Use it without any argument when your directive can be used anywhere.

```ts
import {Component, ParentComponent} from 'slicky/core';

@Component({
	selector: 'child',
	template: 'lorem ipsum',
})
class Child
{

	@ParentComponent(Parent) parent;

}

@Component({
	selector: 'parent',
	template: '<child></child>',
	directives: [Child],
})
class Parent {}
```

```html
<parent></parent>
```

## Inject one specific child into parent component with @ChildDirective()

This method is useful only when you have exactly one directive of given type always in your template. This one directive 
can be injected into its parent. This will not work if directive is inside of embedded template (eg. in `IfDirective`) 
or if there are more of them.

`@Required()` annotation is optional.

```ts
import {Component, ChildDirective, Required} from 'slicky/core';

@Component({
	selector: 'child',
	template: 'lorem ipsum',
})
class Child {}

@Component({
	selector: 'parent',
	template: '<child></child>',
	directives: [Child],
})
class Parent
{

	@Required()
	@ChildDirective(Child)
	child: Child;

}
```

```html
<parent></parent>
```

## Inject any number of children components into parent with @ChildrenDirective()

This approach is extended version of the previous. You can use it if you have varying number of child components.

If you want to listen to some events on `ChildrenDirectivesQuery`, you need to do that in component's `constructor`, not 
in `onInit` method.
  
```ts
import {Component, Input, OnInit, ChildrenDirective, ChildrenDirectivesQuery} from 'slicky/core';
import {ForDirective} from 'slicky/common';

@Component({
	selector: 'child',
	template: 'lorem ipsum',
})
class Child
{

	@Input()
	id;

}

@Component({
	selector: 'parent',
	directives: [Child, ForDirective],
	controllerAs: 'p',
	template: '<child *s:for="#id of p.ids" [id]="id"></child>',
})
class Parent implements OnInit
{
	
	@ChildrenDirective(Child)
	childrenQuery = new ChildrenDirectivesQuery<Child>();

	ids = [1, 2, 3];
	
	children: Array<Child>;
	
	constructor()
	{
		this.childrenQuery.added.subscribe((child: Child) => {
			console.log('Added new child with ID ' + child.id);
		});
		
		this.childrenQuery.removed.subscribe((child: Child) => {
			console.log('Removed child with ID ' + child.id);
		});
		
		this.childrenQuery.updated((children: Array<Child>) => {
			this.children = children;
			console.log('Updated children list');
		});
	}
	
	onInit()
	{
		this.children = this.childrenQuery.directives;
		console.log('Storing initial list of children');
	}

}
```

```html
<parent></parent>
```
