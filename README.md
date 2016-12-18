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

## Next steps

1. [bootstrap](./docs/bootstrap.md)
2. [directives](./docs/directives.md)
3. [components](./docs/components.md)
4. [templating](./docs/templates.md)
5. [communication between components](./docs/communication.md)
6. [filters](./docs/filters.md)
7. [dependency injection](./docs/di.md)
8. [translations](./docs/translations.md)
9. [life cycle events](./docs/life-cycle-events.md)
10. [ElementRef](./docs/element-ref.md)
11. [Extensions](./docs/extensions.md)
