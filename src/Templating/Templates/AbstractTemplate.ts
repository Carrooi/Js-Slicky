import {Scope} from '../../Util/Scope';
import {Dom} from '../../Util/Dom';
import {Realm} from '../../Util/Realm';
import {Helpers} from '../../Util/Helpers';
import {ParametersList, OnDestroy} from '../../Interfaces';
import {Container, CustomServiceDefinition} from '../../DI/Container';
import {ElementRef} from '../ElementRef';
import {EventEmitter} from '../../Util/EventEmitter';
import {ChangeDetectionStrategy} from '../../constants';


declare interface Watcher
{
	watcher: (previous: any, copy: any) => {current: any},
	callback: (data: any) => any,
	current: any,
	copy: any
}


export abstract class AbstractTemplate
{


	private listeners: Array<{el: ElementRef<HTMLElement>, event: string, listener: Function}> = [];

	private parent: AbstractTemplate;

	protected children: Array<AbstractTemplate> = [];

	public realm: Realm;

	public container: Container;

	public scope: Scope;

	protected directives: Array<{el: ElementRef<HTMLElement>, directive: any}> = [];

	public filters: {[name: string]: {filter: any, injectTemplate: boolean}} = {};

	public translations: {[locale: string]: any} = {};

	public changeDetectorStrategy: ChangeDetectionStrategy = ChangeDetectionStrategy.Default;

	private watchers: Array<Watcher> = [];

	public onDestroy: Array<(rootTemplate: AbstractTemplate, template: AbstractTemplate) => void> = [];


	constructor(container: Container, parameters: ParametersList = {}, parent?: AbstractTemplate)
	{
		this.container = container;
		this.scope = new Scope(parameters, parent ? parent.scope : null);

		this.realm = new Realm(this.parent ? this.parent.realm : null, null, () => {
			if (this.changeDetectorStrategy === ChangeDetectionStrategy.Default) {
				this.checkWatchers();
			}
		});

		if (parent) {
			this.parent = parent;
			this.parent.attachChild(this);
			this.changeDetectorStrategy = this.parent.changeDetectorStrategy;
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
		this.watchers = [];

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

		for (let i = 0; i < this.onDestroy.length; i++) {
			this.onDestroy[i](this, this);
		}

		this.directives = [];
		this.listeners = [];
		this.children = [];
		this.onDestroy = [];
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


	public filter(value: string, filterName: string, args: Array<any> = []): string
	{
		let filter = this.findFilter(filterName);

		if (!filter) {
			throw new Error('Could not parse "' + value + '", filter "' + filterName + '" does not exists.');
		}

		args.unshift(value);

		if (filter.injectTemplate) {
			args.unshift(this);
		}

		return filter.filter.transform.apply(filter.filter, args);
	}


	public checkWatchers(): void
	{
		for (let i = 0; i < this.watchers.length; i++) {
			let watcher = this.watchers[i];

			let check = watcher.watcher(watcher.current, watcher.copy);
			if (check !== null) {
				watcher.current = check.current;
				watcher.copy = Helpers.clone(check.current);

				watcher.callback(check.current);
			}
		}

		for (let i = 0; i < this.children.length; i++) {
			if (this.children[i].changeDetectorStrategy === ChangeDetectionStrategy.Default) {
				this.children[i].checkWatchers();
			}
		}
	}


	public watch(getter: (template: AbstractTemplate) => any, fn: (data: any) => any, initValue?: any): void
	{
		let current = typeof initValue === 'undefined' ? getter(this) : initValue;
		let copy = Helpers.clone(current);

		let watcher = (previous: any, copy: any): {current: any} => {
			let current = getter(this);

			if (current !== previous) {
				return {current: current};
			}

			if (Helpers.compare(current, copy)) {
				return {current: current};
			}

			return null;
		};

		this.watchers.push({
			watcher: watcher,
			callback: fn,
			current: current,
			copy: copy,
		});
	}


	public addEventListener(elementRef: ElementRef<HTMLElement>, event: string, call: (e: Event, el: ElementRef<HTMLElement>, template: AbstractTemplate) => void): void
	{
		this.listeners.push({
			el: elementRef,
			event: event,
			listener: this.run(() => Dom.addEventListener(elementRef.nativeElement, event, this, (e: Event) => call(e, elementRef, this))),
		});
	}


	public addDirectiveEventListener(directive: any, event: string, call: ((value: any, directive: any, template: AbstractTemplate) => void)): void
	{
		(<EventEmitter<any>>directive[event]).subscribe((value: any) => this.run(() => call(value, directive, this)));
	}


	public setText(el: Text, text: string): void
	{
		el.nodeValue = text;
	}


	public watchText(el: Text, getter: (template: AbstractTemplate) => string): void
	{
		let text = getter(this);

		this.setText(el, text);

		this.watch(getter, (text: string) => {
			this.setText(el, text);
		}, text);
	}


	public setAttribute(el: HTMLElement, attr: string, value: any): void
	{
		if (value === false || value == null) {
			el.removeAttribute(attr);
		} else {
			el.setAttribute(attr, value);
		}
	}


	public watchAttribute(el: HTMLElement, attr: string, getter: (template: AbstractTemplate) => any): void
	{
		let value = getter(this);

		this.setAttribute(el, attr, value);

		this.watch(getter, (value: any) => {
			this.setAttribute(el, attr, value);
		});
	}


	private setProperty(el: HTMLElement, property: string, value: any): void
	{
		let parts = property.split('.');
		if (parts.length < 1 || parts.length > 2) {
			throw new Error('Invalid property binding "' + property + '" on element "' + Dom.getReadableName(el) + '".');
		}

		if (property === 'class') {
			el.className = value;

		} else if (parts.length === 1) {
			if (value === false || value == null) {
				el.removeAttribute(property);
			} else {
				if (value === true) {
					value = property;
				}

				el.setAttribute(property, value);
			}

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
			throw new Error('Invalid property binding "' + property + '" on element "' + Dom.getReadableName(el) + '".');
		}
	}


	public watchProperty(el: HTMLElement, property: string, getter: (template: AbstractTemplate) => any): void
	{
		let value = getter(this);

		this.setProperty(el, property, value);

		this.watch(getter, (value: any) => {
			this.setProperty(el, property, value);
		});
	}


	private setInput(directive: any, property: string, value: any, callListener: boolean = true): void
	{
		directive[property] = value;

		if (callListener && typeof directive.onUpdate === 'function') {
			directive.onUpdate(property, value);
		}
	}


	public watchInput(directive: any, property: string, getter: (template: AbstractTemplate) => any): void
	{
		let input = getter(this);

		this.setInput(directive, property, input, false);

		this.watch(getter, (input: any) => {
			this.setInput(directive, property, input);
		});
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
