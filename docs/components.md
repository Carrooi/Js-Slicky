# Components

Components are in fact extended [directives](./directives.md) with few added 
features, mainly [templates](./templates.md).

```ts
import {Component} from 'slicky/core';

@Component({
	selector: '[test]',
	controllerAs: 't',
	template: '<span>{{ t.hello }}</span>',
})
export class TestComponent
{

	public hello: string = 'hello world';

}
```

Here we are using feature from angular 1 - `controllerAs`. If you want to have 
access to your component's properties inside of [template](./templates.md) you 
actually have to assign it with `controllerAs` option.

Then you can use it eg. in template (see above) with `t.hello`. 

## Accessibility of components and directives

Now you won't be able to automatically use all of your 
[directives](./directives.md) or components from your project everywhere. You 
actually need to say which directives (or components) are accessible in which 
directive or component.

Eg. `MenuItem` component can be used probably just in `Menu` component, so it 
doesn't need to be registered directly in our `App` main component. But maybe 
`Menu` can be in `App`.

This applies also to build in [directives](./directives.md).

```ts
import {Component} from 'slicky/core';

@Component({
	selector: '[main-menu-item]',
)}
class MenuItem {}

@Component({
	selector: '[main-menu],
	directives: [MenuItem],
})
class Menu {}

@Component({
	selector: '[app]',
	directives: [Menu],
)}
class App {}
```

## Elements

If you want to have simple access to some elements inside of your component 
(you should maybe consider [templates](./templates.md) instead), you can ask 
for them just like for `@Input`s. 

```ts
import {Component, Element} from 'slicky/core';

@Component({
	selector: '[test]',
})
class Test
{

	@HostElement('div > span')
	public child: HTMLElement;

}
```

## Limitations

`@HostEvent` annotations are not always working nicely with custom templates, so you 
should probably avoid doing that and use event binding instead.
