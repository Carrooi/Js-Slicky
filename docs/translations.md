# Translations

Like with included [components](./components.md) or [directives](./directives.md), 
translations are also attached to specific component.

To start using translations, you only need to register `TranslationsExtension`
into your application.

**bootstrap:**

```ts
import {TranslationsExtension} from 'slicky/translations';

// ...

app.addExtension(new TranslationsExtension({
    locale: 'en',       // provide default locale
}));

app.run(AppComponent);
```

## Usage

Translating files are files with all your translations. Basically they are 
just plain JS objects.

```ts
export var contentTranslations = {
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

```ts
import {contentTranslations} from './contentTranslations';

@Component({
    selector: 'content',
    translations: contentTranslations,
    template: '{{ "homepage.headline" | translate }}',
})
class ContentComponent
{
}
```

Output of `ContentComponent` will be `Welcome` text.

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
