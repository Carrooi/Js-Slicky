import {Dom} from './Util/Dom';
import {Container} from './DI/Container';
import {Injectable} from './DI/Metadata';
import {ConcreteType, global} from './Facade/Lang';
import {Application} from "./Application";
import {Functions} from "./Util/Functions";


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


	public compile(el?: Element)
	{
		if (el && el.hasAttribute('data-component')) {
			this.compileElement(<HTMLElement>el);
		}

		this.compileInnerElement(<HTMLElement>el);
	}


	private compileInnerElement(el?: HTMLElement)
	{
		let components = Dom.querySelectorAll('[data-component]', el);
		for (let i = 0; i < components.length; i++) {
			this.compileElement(<HTMLElement>components[i]);
		}
	}


	private compileElement(el: HTMLElement)
	{
		let name = el.getAttribute('data-component');

		if (!this.application.hasController(name)) {
			throw new Error('Component ' + name + ' is not registered.');
		}

		let controller = this.application.createController(name);

		el['__controller'] = controller;

		let metadata = this.application.getControllerMetadata(name);
		let inputs = this.application.getControllerInputs(name);
		let events = this.application.getControllerEvents(name);
		let elements = this.application.getControllerElements(name);

		if (metadata.hasTemplate()) {
			el.innerHTML = metadata.getTemplate();
			this.compileInnerElement(el);
		}

		for (let inputName in inputs) {
			if (inputs.hasOwnProperty(inputName)) {
				let input = inputs[inputName];
				let realInputName = 'data-' + (input.hasName() ? input.getName() : inputName);

				let realValue = el.hasAttribute(realInputName) ?
					this.parseInput(el.getAttribute(realInputName), Reflect.getMetadata('design:type', controller, inputName)) :
					null
				;

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
