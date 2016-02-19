export class Dom
{


	static querySelector(selector: string, parent?: Element): Element
	{
		if (parent) {
			return parent.querySelector(selector);

		} else {
			return document.querySelector(selector);
		}
	}


	static querySelectorAll(selector: string, parent?: Element): NodeListOf<Element>
	{
		if (parent) {
			return parent.querySelectorAll(selector);

		} else {
			return document.querySelectorAll(selector);
		}
	}


	static addEventListener(el: Node|Element|Window, eventName: string, bindTo: any, fn: Function): void
	{
		let listener = (...args: Array<any>) => {
			fn.apply(bindTo, args);
		};

		if (el['addEventListener']) {
			el['addEventListener'](eventName, listener, false);

		} else if (el['attachEvent']) {
			el['attachEvent'].apply('on' + eventName, listener);

		}
	}

}
