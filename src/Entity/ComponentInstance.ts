import {DirectiveInstance} from './DirectiveInstance';
import {ControllerDefinition} from './ControllerParser';
import {ComponentView} from '../Views/ComponentView';
import {Dom} from '../Util/Dom';
import {Compiler} from '../Compiler';


export class ComponentInstance extends DirectiveInstance
{


	public view: ComponentView;

	public definition: ControllerDefinition;


	constructor(view: ComponentView, definition: ControllerDefinition, instance: any)
	{
		super(view, definition, instance, <Element>view.el.nativeEl);
	}


	public processInnerHTML(): void
	{
		if (this.definition.metadata.template === null) {
			throw new Error('Missing template for component "' + this.definition.name + '".');
		}

		(<HTMLElement>this.el).innerHTML = this.definition.metadata.template;
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

}
