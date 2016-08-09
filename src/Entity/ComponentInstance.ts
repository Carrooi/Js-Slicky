import {DirectiveInstance} from './DirectiveInstance';
import {ControllerDefinition} from './ControllerParser';
import {ComponentView} from '../Views/ComponentView';
import {Dom} from '../Util/Dom';
import {Compiler} from '../Compiler';


export class ComponentInstance extends DirectiveInstance
{


	public definition: ControllerDefinition;


	constructor(view: ComponentView, definition: ControllerDefinition, instance: any)
	{
		super(view, definition, instance, <Element>view.el.nativeEl);
	}


	public processInnerHTML(compiler: Compiler): boolean
	{
		if (this.definition.metadata.template) {
			(<HTMLElement>this.el).innerHTML = this.definition.metadata.template;
		}

		if ((<HTMLElement>this.el).innerHTML !== '' && this.definition.metadata.compileInner) {
			compiler.compileNodes(this.view, this.el.childNodes);
			return true;
		}

		return false;
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
