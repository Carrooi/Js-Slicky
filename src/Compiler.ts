import {Dom} from './Util/Dom';
import {Container} from './DI/Container';
import {Injectable} from './DI/Metadata';
import {ConcreteType, global} from './Facade/Lang';
import {Application, ControllerDefinition, InputsList, EventsList} from './Application';
import {Functions} from './Util/Functions';
import {ComponentMetadataDefinition} from './Controller/Metadata';
import {ElementsList} from "./Application";


let Reflect = global.Reflect;


@Injectable()
export class Compiler
{


	private application: Application;


	constructor(application: Application)
	{
		this.application = application;
	}


	public compileHtml(html: string, elName: string = 'div'): HTMLElement
	{
		let el = document.createElement(elName);
		el.innerHTML = html;

		this.compile(el);

		return el;
	}


	public compile(el: Element|Document = document, checkSelf = true)
	{
		let testEl: Element = null;

		if (el.parentElement) {
			testEl = el.parentElement;
		} else if (el instanceof Element) {
			testEl = document.createElement('div');
			testEl.appendChild(el);
		}

		let controllers = this.application.getControllers();
		for (let i = 0; i < controllers.length; i++) {
			let controllerData = controllers[i];
			let elements: Array<Element> = [];

			if (checkSelf && testEl) {
				let component = Dom.querySelector(controllerData.metadata.getSelector(), testEl);
				if (component === el) {
					elements.push(<Element>el);
				}
			}

			let components = Dom.querySelectorAll(controllerData.metadata.getSelector(), <Element>el);
			for (let j = 0; j < components.length; j++) {
				elements.push(components[j]);
			}

			for (let j = 0; j < elements.length; j++) {
				let controller = this.application.createController(controllerData.controller);
				this.compileElement(<HTMLElement>elements[j], controller, controllerData);
			}
		}
	}


	private compileElement(el: HTMLElement, controller: any, definition: ControllerDefinition)
	{
		if (definition.metadata.hasTemplate()) {
			el.innerHTML = definition.metadata.getTemplate();
			this.compile(el, false);
		}

		if (typeof el['__controllers'] === 'undefined') {
			el['__controllers'] = [];
		}

		el['__controllers'].push(controller);

		let inputs = definition.inputs;
		let elements = definition.elements;
		let events = definition.events;

		for (let inputName in inputs) {
			if (inputs.hasOwnProperty(inputName)) {
				let input = inputs[inputName];
				let realInputName = input.hasName() ? input.getName() : inputName;
				let realValue = null;

				if (input.isPropertyInput()) {
					realValue = el[input.getName()] ? el[input.getName()] : null;

				} else if (el.hasAttribute(realInputName)) {
					realValue = this.parseInput(el.getAttribute(realInputName), Reflect.getMetadata('design:type', controller, inputName));
				}

				if (realValue === null && typeof controller[inputName] !== 'undefined') {
					continue;
				}

				controller[inputName] = realValue;
			}
		}

		for (let elementName in elements) {
			if (elements.hasOwnProperty(elementName)) {
				let element = elements[elementName];

				if (element.hasSelector()) {
					let subElements = Dom.querySelectorAll(element.getSelector(), el);

					if (subElements.length === 0) {
						controller[elementName] = null;

					} else if (subElements.length === 1) {
						controller[elementName] = subElements[0];

					} else {
						controller[elementName] = subElements;
					}
				} else {
					controller[elementName] = el;
				}
			}
		}

		for (let eventName in events) {
			if (events.hasOwnProperty(eventName)) {
				let event = events[eventName];

				if (event.getEl() === '@') {
					Dom.addEventListener(el, event.getName(), controller, controller[eventName]);

				} else {
					if (typeof event.getEl() === 'string' && (<string>event.getEl()).substr(0, 1) === '@') {
						let childName = (<string>event.getEl()).substr(1);
						if (typeof controller[childName] === 'undefined') {
							throw new Error('Can not add event listener for @' + childName + ' at ' + Functions.getName(controller));
						}

						Dom.addEventListener(controller[childName], event.getName(), controller, controller[eventName]);

					} else if (typeof event.getEl() === 'string') {
						let eventEls = Dom.querySelectorAll(<string>event.getEl(), el);
						for (let j = 0; j < eventEls.length; j++) {
							Dom.addEventListener(eventEls[j], event.getName(), controller, controller[eventName]);
						}

					} else if (event.getEl() instanceof Window || event.getEl() instanceof Node) {
						Dom.addEventListener(<Node>event.getEl(), event.getName(), controller, controller[eventName]);

					}
				}
			}
		}

		if (typeof controller['onInit'] === 'function') {
			controller.onInit();
		}
	}


	private parseInput(value: any, expects: any): any
	{
		if (expects === Boolean) {
			return value === '' ?
				false :
				(JSON.parse(value) ? true : false)
			;

		} else if (expects === Number) {
			return value === '' ?
				null :
				JSON.parse(value)
			;
		}

		return value;
	}

}
