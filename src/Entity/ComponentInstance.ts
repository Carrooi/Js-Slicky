import {DirectiveInstance} from './DirectiveInstance';
import {ControllerDefinition} from './ControllerParser';
import {ComponentView} from '../Views/ComponentView';
import {Dom} from '../Util/Dom';
import {Compiler} from '../Compiler';
import {ElementRef} from '../Templating/ElementRef';
import {TemplateRef} from '../Templating/TemplateRef';


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

		let el = <HTMLElement>this.el;

		if (el.innerHTML !== '') {
			let template = Dom.el('<template>' + el.innerHTML + '</template>');
			let templateRef = new TemplateRef(ElementRef.getByNode(template));

			this.view.storeTemplate(templateRef);
		}

		el.innerHTML = this.definition.metadata.template;
	}

}
