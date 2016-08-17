const attributes = {
	accept: ['form', 'input'],
	'accept-charset': ['form'],
	accesskey: null,
	action: ['form'],
	align: ['applet', 'caption', 'col', 'colgroup', 'hr', 'iframe', 'img', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr'],
	alt: ['applet', 'area', 'img', 'input'],
	async: ['script'],
	autocomplete: ['form', 'input'],
	autofocus: ['button', 'input', 'keygen', 'select', 'textarea'],
	autoplay: ['audio', 'video'],
	autosave: ['input'],
	buffered: ['audio', 'video'],
	challenge: ['keygen'],
	charset: ['meta', 'script'],
	checked: ['command', 'input'],
	cite: ['blockquote', 'del', 'ins', 'p'],
	'class': null,
	code: ['applet'],
	codebase: ['applet'],
	cols: ['textarea'],
	colspan: ['td', 'th'],
	content: ['meta'],
	contenteditable: null,
	contextmenu: null,
	controls: ['audio', 'video'],
	coords: ['area'],
	data: ['object'],
	datetime: ['del', 'ins', 'time'],
	'default': ['track'],
	defer: ['script'],
	dir: null,
	dirname: ['input', 'textarea'],
	disabled: ['button', 'command', 'fieldset', 'input', 'keygen', 'optgroup', 'option', 'select', 'textarea'],
	download: ['a', 'area'],
	draggable: null,
	dropzone: null,
	enctype: ['form'],
	'for': ['label', 'output'],
	form: ['button', 'fieldset', 'input', 'keygen', 'label', 'meter', 'object', 'output', 'progress', 'select', 'textarea'],
	formaction: ['input', 'button'],
	headers: ['td', 'th'],
	height: ['canvas', 'embed', 'iframe', 'img', 'input', 'object', 'video'],
	hidden: null,
	high: ['metter'],
	href: ['a', 'area', 'base', 'link'],
	hreflang: ['a', 'area', 'link'],
	'http-equiv': ['meta'],
	icon: ['command'],
	id: null,
	ismap: ['img'],
	itemprop: null,
	keytype: ['keygen'],
	kind: ['track'],
	label: ['track'],
	lang: null,
	language: ['script'],
	list: ['input'],
	loop: ['audio', 'bgsound', 'marquee', 'video'],
	low: ['meter'],
	manifest: ['html'],
	max: ['input', 'meter', 'progress'],
	maxlength: ['input', 'textarea'],
	media: ['a', 'area', 'link', 'source', 'style'],
	method: ['form'],
	min: ['input', 'meter'],
	multiple: ['input', 'select'],
	muted: ['video'],
	name: ['button', 'form', 'fieldset', 'iframe', 'input', 'keygen', 'object', 'output', 'select', 'textarea', 'map', 'meta', 'param'],
	novalidate: ['form'],
	open: ['details'],
	optimum: ['meter'],
	pattern: ['input'],
	ping: ['a', 'area'],
	placeholder: ['input', 'textarea'],
	poster: ['video'],
	preload: ['audio', 'video'],
	radiogroup: ['command'],
	readonly: ['input', 'textarea'],
	rel: ['a', 'area', 'link'],
	required: ['input', 'select', 'textarea'],
	reversed: ['ol'],
	rows: ['textarea'],
	rowspan: ['td', 'th'],
	sandbox: ['iframe'],
	scope: ['th'],
	scoped: ['style'],
	seamless: ['iframe'],
	selected: ['option'],
	shape: ['a', 'area'],
	size: ['input', 'select'],
	sizes: ['link', 'img', 'source'],
	span: ['col', 'colgroup'],
	spellcheck: null,
	src: ['audio', 'embed', 'iframe', 'img', 'input', 'script', 'source', 'track', 'video'],
	srcdoc: ['iframe'],
	srclang: ['track'],
	srcset: ['img'],
	start: ['ol'],
	step: ['input'],
	style: null,
	summary: ['table'],
	tabindex: null,
	target: ['a', 'area', 'base', 'form'],
	title: null,
	type: ['button', 'input', 'command', 'embed', 'object', 'script', 'source', 'style', 'menu'],
	usemap: ['img', 'input', 'object'],
	value: ['button', 'option', 'input', 'li', 'meter', 'progress', 'param'],
	width: ['canvas', 'embed', 'iframe', 'img', 'input', 'object', 'video'],
	wrap: ['textarea'],
};


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


	private static createEvent(eventInterface: string, eventName: string): Event
	{
		let event = document.createEvent(eventInterface);
		event.initEvent(eventName, false, true);

		return event;
	}


	public static createHTMLEvent(eventName: string): Event
	{
		return Dom.createEvent('HTMLEvents', eventName);
	}


	public static createMouseEvent(eventName: string): MouseEvent
	{
		return <MouseEvent>Dom.createEvent('MouseEvent', eventName);
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

		if (typeof attributes[main] === 'undefined') {
			return false;
		}

		if (attributes[main] === null) {
			return true;
		}

		if (attributes[main].indexOf(el.nodeName.toLowerCase()) >= 0) {
			return true;
		}

		return /^data-/.test(main);
	}


	public static remove(el: Node): void
	{
		if (el.parentElement) {
			el.parentElement.removeChild(el);
		}
	}

}
