# Translations

Like with included [components](./components.md) or [directives](./directives.md), 
translations are also attached to specific component.

To start using translations, you need to register `Translator` service into 
[di container](./di.md) and also register the `TranslateFilter`. This is a
[template filter](./templates.md) which will actually allow you to translate 
something from template.

**bootstrap:**

```ts
import 'es7-reflect-metadata/dist/browser';

import {Application, Translator} from 'slicky/core';
import {Container} from 'slicky/di';

import {AppComponent} from './components/AppComponent';

let container = new Container;
container.provide(Translator);

let app = new Application(container);
app.run(AppComponent);
```

**AppComponent:**

Here you also need to set current language based on some of your checks.
This setup needs to be in `constructor` so it will be called before any compiling.

```ts
import {Component, Translator} from 'slicky/core';
import {TranslateFilter} from 'slicky/common';

import {appTranslations} from './translations';

@Component({
	selector: 'app',
	filters: [TranslateFilter],
	translations: translations,
})
export class AppComponent
{


	constructor(translator: Translator)
	{
		translator.locale = 'en';
	}

}
```

## Writing translating files

Translating files are files with all your translations. Basically they are 
just plain JS objects.

```ts
export var appTranslations = {
	en: {
		homepage: {
			headline: 'Welcome',
		},
	},
	cs: {
		...
	},
};
```

## Using translations

Given the translation above, you could use it in [template](./templates.md) 
like this:

```html
{{ "homepage.headline" | translate }}
```

Output will be `Welcome`.

## Plural forms

This translator also contains definitions to many plural forms in many languages.
You just need to write all forms of translation into your translation file.

```ts
export var appTranslations = {
	en: {
		apple: [
			'1 apple',
			'%count% apples',
		],
	},
	cs: {
		...
	},
};
```

```html
{{ "apple" | translate : 1 }}, {{ "apple" | translate : 7 }}
```

Output will be `1 apple, 7 apples`.

## Replacements in translations

Sometimes you may want to use some custom "variables" inside of translations
similar to `%count%` in previous example.

```ts
export var appTranslations = {
	en: {
		car: "%color% car",
	},
};
```

```html
{{ "car" : {color: "blue"} }}
```

Output will be `blue car`.

Or if you want to combine counts with replacements inside of template:

```ts
export var appTranslations = {
	en: {
		car: [
			"1 %color% car",
			"%count% %color% cars",
		],
	},
};
```

```html
{{ "car" : 1 : {color: "blue"} }}, {{ "car" : 4 : {color: "red"} }}
```

Output will be `1 blue car, 4 red cars`.
