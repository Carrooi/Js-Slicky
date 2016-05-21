# Filters

There are some template filters which can be used in text expressions like this:

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

## Custom filters

```ts
import {Filter} from 'slicky/core';

@Filter({
	name: 'plus',
})
export class PlusFilter
{


	public transform(num: number, add: number): number
	{
		return num + add;
	}

}
```

Now you can use it inside of your [component](./components.md):

```ts
import {Component} from 'slicky/core';
import {PlusFilter} from './PlusFilter';

@Component({
	selector: '[plus-component]',
	filters: [PlusFilter],
	template: '5 + 2 = <strong>{{ 5 | plus : 2 }}</strong>',
})
export class PlusComponent
{
}
```
