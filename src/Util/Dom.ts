export class Dom
{


	public static el(html: string): HTMLElement
	{
		let parent = document.createElement('div');
		parent.innerHTML = html;

		let el = parent.children[0];
		parent.removeChild(el);

		return <HTMLElement>el;
	}


	public static querySelector(selector: string, parent?: Element): Element
	{
		if (parent) {
			return parent.querySelector(selector);

		} else {
			return document.querySelector(selector);
		}
	}


	public static querySelectorAll(selector: string, parent?: Element): NodeListOf<Element>
	{
		if (parent) {
			return parent.querySelectorAll(selector);

		} else {
			return document.querySelectorAll(selector);
		}
	}


	public static matches(el: Element, selector: string): boolean
	{
		let matcher =
			Element.prototype['matches'] ||
			Element.prototype['webkitMatchesSelector'] ||
			Element.prototype['mozMatchesSelector'] ||
			Element.prototype['msMatchesSelector'] ||
			Element.prototype['oMatchesSelector'] ||
			(function(selector: string) {
				let matches = Dom.querySelectorAll(selector, this['document'] || this.ownerDocument);
				let i = matches.length;

				while (--i >= 0 && matches.item(i) !== this) {}

				return i > -1;
			})
		;

		return matcher.call(el, selector);
	}


	public static addEventListener(el: Node|Element|Window, eventName: string, bindTo: any, fn: Function): Function
	{
		let listener = (...args: Array<any>) => {
			fn.apply(bindTo, args);
		};

		if (el['addEventListener']) {
			el['addEventListener'](eventName, listener, false);

		} else if (el['attachEvent']) {
			el['attachEvent'].apply('on' + eventName, listener);

		}

		return listener;
	}


	public static removeEventListener(el: Node|Element|Window, eventName: string, listener: Function): void
	{
		if (el['removeEventListener']) {
			el['removeEventListener'](eventName, <any>listener, false);

		} else if (el['detachEvent']) {
			el['detachEvent'].apply('on' + eventName, listener);
		}
	}


	public static createMouseEvent(eventName: string): MouseEvent
	{
		let event = document.createEvent('MouseEvent');
		event.initMouseEvent(eventName, true, true, window, null, 0, 0, 0, 0, false, false, false, false, 0, null);

		return event;
	}


	public static hasCssClass(el: Element, className: string): boolean
	{
		if (el.classList) {
			return el.classList.contains(className);
		}

		let classList = el.className.split(' ');

		return classList.indexOf(className) > -1;
	}


	public static addCssClass(el: Element, className: string): void
	{
		if (el.classList) {
			el.classList.add(className);

		} else if (!Dom.hasCssClass(el, className)) {
			let classList = el.className.split(' ');
			classList.push(className);
			el.className = classList.join(' ');
		}
	}


	public static removeCssClass(el: Element, className: string): void
	{
		if (el.classList) {
			el.classList.remove(className);

		} else if (Dom.hasCssClass(el, className)) {
			let classList = el.className.split(' ');
			classList.splice(classList.indexOf(className), 1);
			el.className = classList.join(' ');
		}
	}


	public static insertBefore(newChild: Node, refChild: Node): void
	{
		refChild.parentNode.insertBefore(newChild, refChild);
	}


	public static insertAfter(newChild: Node, refChild: Node): void
	{
		if (refChild.nextSibling) {
			refChild.parentElement.insertBefore(newChild, refChild.nextSibling);
		} else {
			refChild.parentElement.appendChild(newChild);
		}
	}


	public static getReadableName(el: Element): string
	{
		let name = el.nodeName.toLowerCase();

		if (el.id) {
			name += '#' + el.id;
		}

		if (el.className !== '') {
			name += '.' + el.className.split(' ').join('.');
		}

		return name;
	}


	public static propertyExists(el: Node, prop: string): boolean
	{
		let main = prop.split('.')[0];

		if (typeof el[main] !== 'undefined') {
			return true;
		}

		let other = ['disabled', 'class'];

		return other.indexOf(main) > -1;
	}

}
