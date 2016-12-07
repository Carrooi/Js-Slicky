# Templates

Templates in slicky are ordinary HTML files with some added features.

Example of template in slicky:

```html
<div notifications>
	<ul>
		<li *s:for="#notification in notifications.data">
			{{ notification.message }}
		</li>
	</ul>
</div>
```

## Text expressions

All code between `{{` and `}}` is automatically parsed as javascript, so you 
can use it for displaying any variables from your [components](./components.md). 
Elements' attributes are parsed like this as well.

### Filters

See [filters](./filters.md).

## Property binding

With this feature, you can set element's properties directly (not attributes), 
which is really good for setting images' sources or passing data from parent 
[component](./components.md) to child.

```html
<div>
	<a *s:for="#item of links.list" [href]="item" [target]="item"></a>
</div>
```

## Event binding

You can also listen for some events directly from templates just like in angular 2.

```html
<a href="#" (click)="callMe($event)">click</a>
```

or listening to multiple events from one definition:

```html
<input type="text" (change|keyup|paste)="cmp.onInputChanged($event)">
```

it is also possible to automatically call `$event.preventDefault()` without the 
need to always pass `$event` object into your listeners:

```html
<input type="text" (change|keyup|paste)!="cmp.updateValue($this.value)">
```

## Two way data binding

Two way data binding between [components](./components.md) is also possible just like in angular 2.

```ts
@Component({
	selector: 'child',
	template: '',
})
class Child
{

	@Input() data;
	@Output() dataChange = new EventEmitter<any>();

}

@Component({
	selector: 'parent',
	controllerAs: 'p',
	template: '<child [(data)]="p.childData"></child>',
	directives: [Child],
})
class Parent
{
	
	childData = 'lorem ipsum';
	
}
```

Parent's template is equivalent to:
 
```html
<child [data]="p.childData" (data-change)="p.childData=$value"></child>
```

## Template element

When you create HTML element `<template>` it will be removed from DOM and kept 
just in memory. Then it can be used by some [directives](./directives.md).

There is also shortcut for creating templates:

```html
<span *s:if="true">hello</span>
```

That will actually create:

```html
<template [s:if]="true">
	<span>hello</span>
</template>
```

## Importing template blocks

You can also reuse `<template>` blocks later in your template. You just need to 
add some `id` attribute.

```html
<template id="tmpl">
	Hello
</template>

<content select="#tmpl"></content>
<content select="#tmpl"></content>
```

And result will be: `Hello Hello`.

This alone is actually not so useful so let's pass some additional parameters
into the template block.

```
<template id="tmpl">
	Hello {{ name + last ? ', ' : '' }}
</template>

<content select="#tmpl" import="name: 'Clare'"></content>
<content select="#tmpl" import="name: 'David', last: true"></content>
```

Result: `Hello Clare, Hello David`.

The `import` attribute is actually parsed as javascript object with access to 
current template parameters. That means that you have access to eg. parent 
component and that the code needs to be valid javascript when you add `{` to 
the beginning and `}` to the end of your `import` code.

## Default directives

There are some default directives build into this framework. 

### IfDirective (`*s:if`)

Used when you need to conditionally show some element in DOM. This directive is 
not working with visibility of object but with removing and appending elements.

```html
<span *s:if="t.hello">{{ t.hello }}</span>
```

### ForDirective (`*s:for`)

Used for iterating through arrays or objects in templates.

**Without key:**

```html
<span *s:for="#item of t.items">{{ item }}</span>
```

**With key:**

```html
<span *s:for="#item of t.items; #i index">{{ i + ": " + item }}</span>
```

### ClassDirective (`s:class`)

Directive for changing element classes by object

```html
<div [s:class]="{btn: isButton(), alert: isAlert()}">...</div>
```

### AttrDirective (`s:attr`)

Similar to `ClassDirective`, but sets all list of attributes.

```html
<div [s:attr]="{title: 'Some div'}">...</div>
```

### NotParseDirective (`s:not-parse`)

This directive will stop all parsing of inner child elements.
