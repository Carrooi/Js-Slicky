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

There are also some filters which can be used in text expressions like this:

```html
<span>{{ message | truncate : '300' : '...' | replace : '_' : '-' }}</span>
```

This expression truncates `message` variable to max 300 letters, adds `...` if 
text is longer than that and replaces all underscore letters with dashes.

**List of default filters**:

* `truncate(length, append = "&hellip;")`
* `substr(from, length)`
* `trim`
* `replace(search, replace = "")`
* `join(list, glue)`
* `lower`
* `upper`
* `firstUpper`
* `length`
* `json`

## Property binding

With this feature, you can set element's properties directly (not attributes), 
which is really good for setting images' sources or passing data from parent 
[component](./components.md) to child.

```html
<div>
	<a *s:for="#item in links.list" [href]="item" [target]="item"></a>
</div>
```

## Event binding

You can also listen for some events directly from templates just like in angular 
2.

```html
<a href="#" (click)="callMe($event)">click</a>
```

## Template element

When you create HTML element `<template>` it will be removed from DOM and kept 
just in memory. Then it can be used by some [directives](./directives.md).

There is also shortcut for creating templates:

```html
<span *s:if="true">hello</span>
```

will actually create:

```html
<template [s:if]="true">
	<span>hello</span>
</template>
```

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

```html
<span *s:for="#i, #item in t.items">{{ i + ": " + item" }}</span>
```

* `*s:for="#i, #item in items"`: iterate through array and store key with value
* `*s:for="#item in items"`: iterate through array and store value
* `*s:for="#key, #value of options"`: iterate through object and store key with value
* `*s:for="#value of options"`: iterate through object and store value

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
