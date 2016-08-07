import {DirectiveDefinition} from './DirectiveParser';
import {ComponentView} from '../Views/ComponentView';
import {OnDestroy, OnInit, OnChange, OnUpdate} from '../Interfaces';
import {ChangedObject} from '../Util/Watcher';
import {Dom} from '../Util/Dom';
import {ExpressionParser, Expression} from '../Parsers/ExpressionParser';
import {AttributesList} from '../Templating/ElementRef';


export class DirectiveInstance
{


	public view: ComponentView;

	public definition: DirectiveDefinition;

	public instance: any;

	public el: Element;


	constructor(view: ComponentView, definition: DirectiveDefinition, instance: any, el: Element)
	{
		this.view = view;
		this.definition = definition;
		this.instance = instance;
		this.el = el;
	}


	public attach(): void
	{
		if (typeof this.instance['onInit'] === 'function') {
			(<OnInit>this.instance).onInit();
		}
	}


	public detach(): void
	{
		if (typeof this.instance['onDestroy'] === 'function') {
			(<OnDestroy>this.instance).onDestroy();
		}
	}


	public bindInputs(attributes: AttributesList): void
	{
		let hasOnChange = typeof this.instance['onChange'] === 'function';
		let hasOnUpdate = typeof this.instance['onUpdate'] === 'function';

		((instance, definition, hasOnChange, hasOnUpdate) => {
			let processInput = (inputName: string, required: boolean, expr: Expression, changed: Array<ChangedObject> = null) => {
				let stop = false;

				if (hasOnChange) {
					stop = (<OnChange>instance).onChange(inputName, changed) === false;
				}

				if (!stop) {
					let value = ExpressionParser.parse(expr, this.view.parameters);

					instance[inputName] = value;

					if (hasOnUpdate) {
						(<OnUpdate>instance).onUpdate(inputName, value);
					}
				}
			};

			for (let inputName in definition.inputs) {
				if (definition.inputs.hasOwnProperty(inputName)) {
					let input = definition.inputs[inputName];
					let realInputName = (input.name ? input.name : inputName).toLowerCase();

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
						if (attr.property) {
							let expr = ExpressionParser.precompile(attr.expression);

							processInput(inputName, input.required, expr);

							((inputName, required, expr) => {
								this.view.watch(expr, (changed) => {
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

		for (let attrName in attributes) {
			if (attributes.hasOwnProperty(attrName)) {
				let attr = attributes[attrName];

				if (attr.property && !attr.bound) {
					throw new Error('Could not bind property ' + attr.name + ' to element ' + Dom.getReadableName(this.el) + ' or to any of its directives.');
				}
			}
		}
	}


	public processHostEvents(): void
	{
		for (let eventName in this.definition.events) {
			if (this.definition.events.hasOwnProperty(eventName)) {
				let event = this.definition.events[eventName];

				if (event.el === '@') {
					Dom.addEventListener(this.el, event.name, this.instance, this.instance[eventName]);

				} else {
					if (typeof event.el === 'string' && (<string>event.el).substr(0, 1) === '@') {
						let childName = (<string>event.el).substr(1);
						if (typeof this.instance[childName] === 'undefined') {
							throw new Error('Can not add event listener for @' + childName + ' at ' + this.definition.name);
						}

						Dom.addEventListener(this.instance[childName], event.name, this.instance, this.instance[eventName]);

					} else if (typeof event.el === 'string') {
						let eventEls = Dom.querySelectorAll(<string>event.el, this.el);
						for (let j = 0; j < eventEls.length; j++) {
							Dom.addEventListener(eventEls[j], event.name, this.instance, this.instance[eventName]);
						}

					} else if (event.el instanceof Window || event.el instanceof Node) {
						Dom.addEventListener(<Node>event.el, event.name, this.instance, this.instance[eventName]);

					}
				}
			}
		}
	}

}
