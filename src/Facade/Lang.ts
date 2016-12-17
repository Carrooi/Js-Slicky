/**
 * Taken from angular
 * @link https://github.com/angular/angular/blob/2a70f4e4c7f20cfeac7af236648f0d17b25e983d/modules/angular2/src/facade/lang.ts
 */


export interface BrowserNodeGlobal {
	Object: typeof Object;
	Array: typeof Array;
	Date: DateConstructor;
	RegExp: RegExpConstructor;
	JSON: typeof JSON;
	Math: any;  // typeof Math;
	Reflect: any;
	setTimeout: Function;
	clearTimeout: Function;
	setInterval: Function;
	clearInterval: Function;
}

// Need to declare a new variable for global here since TypeScript
// exports the original value of the symbol.
let _global: BrowserNodeGlobal = <any>window;

export {_global as global};

export let Type = Function;

/**
 * Runtime representation a type that a Component or other object is instances of.
 *
 * An example of a `Type` is `MyCustomComponent` class, which in JavaScript is be represented by
 * the `MyCustomComponent` constructor function.
 */
export interface Type extends Function {}

/**
 * Runtime representation of a type that is constructable (non-abstract).
 */
export interface ConcreteType extends Type { new (...args): any; }

export function CONST(): ClassDecorator & PropertyDecorator {
	return (target) => target;
}

export function isFunction(obj: any): boolean {
	return typeof obj === "function";
}

export function stringify(token): string {
	if (typeof token === 'string') {
		return token;
	}

	if (token === undefined || token === null) {
		return '' + token;
	}

	if (token.name) {
		return token.name;
	}
	if (token.overriddenName) {
		return token.overriddenName;
	}

	let res = token.toString();
	let newLineIndex = res.indexOf("\n");
	return (newLineIndex === -1) ? res : res.substring(0, newLineIndex);
}
