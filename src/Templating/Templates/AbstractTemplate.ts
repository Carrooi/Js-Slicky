import {Scope} from '../../Util/Scope';
import {SafeEval} from '../../Util/SafeEval';
import {Dom} from '../../Util/Dom';
import {ChangeDetector} from '../../ChangeDetection/ChangeDetector';
import {ParametersList, Expression, OnDestroy} from '../../Interfaces';
import {Container, CustomServiceDefinition} from '../../DI/Container';
import {ElementRef} from '../ElementRef';
import {Realm} from '../../Util/Realm';
import {ChangeDetectionStrategy} from '../../constants';


export abstract class AbstractTemplate
{


	private listeners: Array<{el: ElementRef<HTMLElement>, event: string, listener: Function}> = [];

	private parent: AbstractTemplate;

	protected children: Array<AbstractTemplate> = [];

	protected realm: Realm;

	public container: Container;

	public scope: Scope;

	protected directives: Array<{el: ElementRef<HTMLElement>, directive: any}> = [];

	public filters: {[name: string]: {filter: any, injectTemplate: boolean}} = {};

	public translations: {[locale: string]: any} = {};

	public changeDetector: ChangeDetector;


	constructor(container: Container, parameters: ParametersList = {}, parent?: AbstractTemplate)
	{
		this.container = container;
		this.scope = new Scope(parameters, parent ? parent.scope : null);
		this.changeDetector = new ChangeDetector(this.scope, parent ? parent.changeDetector : null);

		this.realm = new Realm(this.parent ? this.parent.realm : null, null, () => {
			if (this.changeDetector.strategy === ChangeDetectionStrategy.Default) {
				this.changeDetector.check();
			}
		});

		if (parent) {
			this.parent = parent;
			this.parent.attachChild(this);
		}
	}


	public run(fn: () => void): any
	{
		return this.realm.run(fn);
	}


	public attachChild(child: AbstractTemplate): void
	{
		this.children.push(child);
	}


	public detachChild(child: AbstractTemplate): void
	{
		let i = this.children.indexOf(child);
		if (i > -1) {
			this.children.splice(i, 1);
		}
	}


	public destroy(): void
	{
		this.changeDetector.disable();

		if (this.parent) {
			this.parent.detachChild(this);
		}

		for (let i = 0; i < this.directives.length; i++) {
			if (typeof this.directives[i].directive.onDestroy === 'function') {
				(<OnDestroy>this.directives[i].directive).onDestroy();
			}
		}

		for (let i = 0; i < this.listeners.length; i++) {
			Dom.removeEventListener(this.listeners[i].el.nativeElement, this.listeners[i].event, this.listeners[i].listener);
		}

		for (let i = 0; i < this.children.length; i++) {
			this.children[i].destroy();
		}

		this.directives = [];
		this.listeners = [];
		this.children = [];
	}


	public addFilter(name: string, filter: any, injectTemplate: boolean = false): void
	{
		this.filters[name] = {
			filter: filter,
			injectTemplate: injectTemplate,
		};
	}


	public createInstance(object: any, use: Array<CustomServiceDefinition> = []): any
	{
		return this.container.create(object, use);
	}


	public attachDirective(directiveType: any, elementRef: ElementRef<HTMLElement>, use: Array<CustomServiceDefinition> = []): any
	{
		use.push({
			service: ElementRef,
			options: {
				useFactory: () => elementRef,
			},
		});

		let directive = this.createInstance(directiveType, use);
		this.directives.push({
			el: elementRef,
			directive: directive,
		});

		return directive;
	}


	protected appendChild(parent: HTMLElement, node: Node, before?: Node, definition?: (node: Node) => void): Node
	{
		if (before) {
			parent.insertBefore(node, before);
		} else {
			parent.appendChild(node);
		}

		if (definition) {
			definition(node);
		}

		return node;
	}


	public appendText(parent: HTMLElement, text: string, before?: Node, definition?: (node: Text) => void): Text
	{
		return <Text>this.appendChild(parent, document.createTextNode(text), before, definition);
	}


	public appendElement(parent: HTMLElement, name: string, before?: Node, definition?: (el: HTMLElement) => void): HTMLElement
	{
		return <HTMLElement>this.appendChild(parent, document.createElement(name), before, definition);
	}


	public appendComment(parent: HTMLElement, comment: string, before?: Node, definition?: (node: Comment) => void): Comment
	{
		return <Comment>this.appendChild(parent, document.createComment(comment), before, definition);
	}


	protected eval(code: string, parameters: {[name: string]: any} = {}, provider: boolean = false): any
	{
		parameters['_t'] = this;

		return SafeEval.run((provider ? 'return ' : '') + code, parameters, {
			bindTo: this,
		});
	}


	protected evalExpression(expression: Expression, parameters: {[name: string]: any} = {}, provider: boolean = false): any
	{
		let value = this.eval(expression.code, parameters, provider);

		for (let i = 0; i < expression.filters.length; i++) {
			let data = expression.filters[i];
			let filter = this.findFilter(data.name);

			if (!filter) {
				throw new Error('Could not parse "' + expression.code + '", filter "' + data.name + '" does not exists.');
			}

			let args = [];

			if (filter.injectTemplate) {
				args.push(this);
			}

			args.push(value);

			for (let j = 0; j < data.arguments.length; j++) {
				args.push(this.evalExpression(data.arguments[j], {}, true));
			}

			value = filter.filter.transform.apply(filter.filter, args);
		}

		return value;
	}


	protected watch(expression: Expression, listener: () => void): void
	{
		this.changeDetector.watch(expression, true, listener);
	}


	public addEventListener(elementRef: ElementRef<HTMLElement>, event: string, call: string|((e: Event, el: ElementRef<HTMLElement>) => void)): void
	{
		this.listeners.push({
			el: elementRef,
			event: event,
			listener: this.run(() => Dom.addEventListener(elementRef.nativeElement, event, this, (e: Event) => {
				if (typeof call === 'string') {
					this.eval(<string>call, {
						'$event': e,
						'$this': elementRef,
					});
				} else {
					call(e, elementRef);
				}
			})),
		});
	}


	protected watchAttribute(el: HTMLElement, attr: string, expression: Expression): void
	{
		this.setAttribute(el, attr, expression);

		this.watch(expression, () => {
			this.setAttribute(el, attr, expression);
		});
	}


	protected watchProperty(el: HTMLElement, prop: string, expression: Expression): void
	{
		this.setProperty(el, prop, expression.code);

		this.watch(expression, () => {
			this.setProperty(el, prop, expression.code);
		});
	}


	protected watchExpression(text: Text, expression: Expression): void
	{
		this.setText(text, expression);

		this.watch(expression, () => {
			this.setText(text, expression);
		});
	}


	public watchInput(directive: any, prop: string, expression: Expression): void
	{
		this.setInput(directive, prop, expression.code, false);

		this.watch(expression, () => {
			this.setInput(directive, prop, expression.code);
		});
	}


	private setText(text: Text, expression: Expression): void
	{
		text.nodeValue = this.evalExpression(expression, {}, true);
	}


	private setAttribute(el: HTMLElement, attr: string, expression: Expression): void
	{
		el.setAttribute(attr, this.evalExpression(expression, {
			'$this': el,
		}, true));
	}


	private setProperty(el: HTMLElement, prop: string, expression: string): void
	{
		let parts = prop.split('.');
		if (parts.length < 1 || parts.length > 2) {
			throw new Error('Invalid property binding "' + prop + '" on element "' + Dom.getReadableName(el) + '".');
		}

		let value = this.eval('return ' + expression, {
			'$this': el,
		});

		if (prop === 'class') {
			el.className = value;

		} else if (parts.length === 1) {
			el[prop] = value

		} else if (parts[0] === 'style') {
			el.style[parts[1]] = !value ?
				null :
				value
			;

		} else if (parts[0] === 'class') {
			if (value) {
				Dom.addCssClass(el, parts[1]);
			} else {
				Dom.removeCssClass(el, parts[1]);
			}

		} else {
			throw new Error('Invalid property binding "' + prop + '" on element "' + Dom.getReadableName(el) + '".');
		}
	}


	private setInput(directive: any, prop: string, expression: string, callListener: boolean = true): void
	{
		directive[prop] = this.eval('return ' + expression);

		if (callListener && typeof directive.onUpdate === 'function') {
			directive.onUpdate(prop, directive[prop]);
		}
	}


	protected findFilter(name: string): {filter: any, injectTemplate: boolean}
	{
		if (typeof this.filters[name] !== 'undefined') {
			return this.filters[name];
		}

		if (this.parent) {
			return this.parent.findFilter(name);
		}

		return null;
	}


	public findTranslation(locale: string, message: string): any
	{
		if (typeof this.translations[locale] === 'undefined') {
			if (this.parent) {
				return this.parent.findTranslation(locale, message);
			} else {
				return null;
			}
		}

		let parts = message.split('.');
		let translation = this.translations[locale];

		for (let i = 0; i < parts.length; i++) {
			if (typeof translation[parts[i]] === 'undefined') {
				translation = null;
				break;
			}

			translation = translation[parts[i]];
		}

		if (translation !== null) {
			return translation;
		}

		if (translation === null && this.parent) {
			return this.parent.findTranslation(locale, message);
		}

		return null;
	}

}
