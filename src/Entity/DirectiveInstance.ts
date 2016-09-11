import {DirectiveDefinition} from './DirectiveParser';
import {RenderableView} from '../Views/RenderableView';
import {OnDestroy, OnInit, OnChange, OnUpdate, ChangedItem} from '../Interfaces';
import {Dom} from '../Util/Dom';
import {ExpressionParser} from '../Parsers/ExpressionParser';
import {AttributesList, Expression} from '../Interfaces';


export class DirectiveInstance
{


	public view: RenderableView;

	public definition: DirectiveDefinition;

	public instance: any;

	public el: Element;

	private eventListeners: Array<{el: Node|Element|Window, event: string, listener: () => {}}> = [];

	private watchers: Array<number> = [];


	constructor(view: RenderableView, definition: DirectiveDefinition, instance: any, el: Element)
	{
		this.view = view;
		this.definition = definition;
		this.instance = instance;
		this.el = el;
	}


	public attach(): void
	{
		if (typeof this.instance['onInit'] === 'function') {
			this.view.run(() => (<OnInit>this.instance).onInit());
		}
	}


	public detach(): void
	{
		for (let i = 0; i < this.eventListeners.length; i++) {
			let event = this.eventListeners[i];
			Dom.removeEventListener(event.el, event.event, event.listener);
		}

		for (let i = 0; i < this.watchers.length; i++) {
			let watcher = this.watchers[i];
			this.view.changeDetector.unwatch(watcher);
		}

		if (typeof this.instance['onDestroy'] === 'function') {
			this.view.run(() => (<OnDestroy>this.instance).onDestroy());
		}
	}


	public bindInputs(attributes: AttributesList, checkBoundProperties: boolean = true): void
	{
		let hasOnChange = typeof this.instance['onChange'] === 'function';
		let hasOnUpdate = typeof this.instance['onUpdate'] === 'function';

		((instance, definition, hasOnChange, hasOnUpdate) => {
			let processInput = (inputName: string, required: boolean, expr: Expression, changed: ChangedItem = null) => {
				let stop = false;

				if (hasOnChange) {
					stop = this.view.run(() => (<OnChange>instance).onChange(inputName, changed) === false);
				}

				if (!stop) {
					let value = this.view.evalExpression(expr, {}, true);

					instance[inputName] = value;

					if (hasOnUpdate) {
						this.view.run(() => (<OnUpdate>instance).onUpdate(inputName, value));
					}
				}
			};

			for (let inputName in definition.inputs) {
				if (definition.inputs.hasOwnProperty(inputName)) {
					let input = definition.inputs[inputName];
					let realInputName = input.name ? input.name : inputName;

					let attr = attributes[realInputName];

					if (typeof attr === 'undefined') {
						if (typeof this.el[realInputName] === 'undefined') {
							if (input.required) {
								throw new Error('Component\'s input ' + definition.name + '::' + inputName + ' was not found in ' + Dom.getReadableName(this.el) + ' element.');
							} else if (typeof instance[inputName] !== 'undefined') {
								continue;
							}
						}

						instance[inputName] = this.el[realInputName];

					} else {
						if (attr.expression === '') {
							attr.bound = true;
							continue;
						}

						if (attr.property) {
							let expr = ExpressionParser.parse(attr.expression);

							processInput(inputName, input.required, expr);

							((inputName, required, expr) => {
								this.watch(expr, true, (changed: ChangedItem) => {
									processInput(inputName, required, expr, changed);
								});
							})(inputName, input.required, expr);
						} else {
							instance[inputName] = attr.expression;
						}

						attr.bound = true;
					}
				}
			}
		})(this.instance, this.definition, hasOnChange, hasOnUpdate);

		if (checkBoundProperties) {
			for (let attrName in attributes) {
				if (attributes.hasOwnProperty(attrName)) {
					let attr = attributes[attrName];

					if (attr.property && !attr.bound) {
						throw new Error('Could not bind property ' + attr.name + ' to element ' + Dom.getReadableName(this.el) + ' or to any of its directives.');
					}
				}
			}
		}
	}


	public processHostEvents(): void
	{
		for (let eventName in this.definition.events) {
			if (this.definition.events.hasOwnProperty(eventName)) {
				((eventName, event) => {
					if (event.el === '@') {
						this.addEventListener(this.el, event.name, this.instance[eventName]);

					} else {
						if (typeof event.el === 'string' && (<string>event.el).substr(0, 1) === '@') {
							let childName = (<string>event.el).substr(1);
							if (typeof this.instance[childName] === 'undefined') {
								throw new Error('Can not add event listener for @' + childName + ' at ' + this.definition.name);
							}

							this.addEventListener(this.instance[childName], event.name, this.instance[eventName]);

						} else if (typeof event.el === 'string') {
							let eventEls = Dom.querySelectorAll(<string>event.el, this.el);
							for (let j = 0; j < eventEls.length; j++) {
								this.addEventListener(eventEls[j], event.name, this.instance[eventName]);
							}

						} else if (event.el instanceof Window || event.el instanceof Node) {
							this.addEventListener(event.el, event.name, this.instance[eventName]);

						}
					}
				})(eventName, this.definition.events[eventName]);
			}
		}
	}


	public processHostElements(): void
	{
		let elements = this.definition.elements;
		for (let elementName in elements) {
			if (elements.hasOwnProperty(elementName)) {
				let element = elements[elementName];

				if (element.selector) {
					let subElements = Dom.querySelectorAll(element.selector, this.el);

					if (subElements.length === 0) {
						this.instance[elementName] = null;

					} else if (subElements.length === 1) {
						this.instance[elementName] = subElements[0];

					} else {
						this.instance[elementName] = subElements;
					}
				} else {
					this.instance[elementName] = this.el;
				}
			}
		}
	}


	private addEventListener(el: Node|Element|Window, event, fn: () => void): void
	{
		let listener = this.view.run(() => Dom.addEventListener(el, event, this.instance, fn));

		this.eventListeners.push({
			el: el,
			event: event,
			listener: listener,
		});
	}


	private watch(expr: Expression, allowCalls: boolean, listener: (changed: ChangedItem) => void): void
	{
		let id = this.view.watch(expr, allowCalls, listener);

		this.watchers.push(id);
	}

}
