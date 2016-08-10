import {Container} from './DI/Container';
import {DirectiveDefinition} from './Entity/DirectiveParser';
import {ControllerDefinition} from './Entity/ControllerParser';
import {ComponentMetadataDefinition} from './Entity/Metadata';
import {DirectiveInstance} from './Entity/DirectiveInstance'
import {ComponentInstance} from './Entity/ComponentInstance'
import {ElementRef} from './Templating/ElementRef';
import {TemplateRef} from './Templating/TemplateRef';
import {ChangeDetectorRef} from './ChangeDetection/ChangeDetectorRef'
import {ComponentView} from './Views/ComponentView';
import {Dom} from './Util/Dom';


export class DirectiveFactory
{


	private container: Container;


	constructor(container: Container)
	{
		this.container = container;
	}


	public create(view: ComponentView, definition: DirectiveDefinition, elementRef: ElementRef, templateRef?: TemplateRef): DirectiveInstance
	{
		if (definition.metadata instanceof ComponentMetadataDefinition) {
			view = view.fork(elementRef);
		}

		let instance = this.createInstance(view, definition, elementRef, templateRef);
		let el = <Element>elementRef.nativeEl;
		let entity: DirectiveInstance = null;

		if (definition.metadata instanceof ComponentMetadataDefinition) {
			entity = new ComponentInstance(view, <ControllerDefinition>definition, instance);
		} else {
			entity = new DirectiveInstance(view, definition, instance, el);
		}

		return entity;
	}


	public createInstance(view: ComponentView, definition: DirectiveDefinition, elementRef: ElementRef, templateRef?: TemplateRef): any
	{
		return this.container.create(<any>definition.directive, [
			{
				service: ElementRef,
				options: {
					useFactory: () => elementRef,
				},
			},
			{
				service: ComponentView,
				options: {
					useFactory: () => view,
				},
			},
			{
				service: ChangeDetectorRef,
				options: {
					useFactory: () => view.changeDetectorRef,
				},
			},
			{
				service: TemplateRef,
				options: {
					useFactory: () => {
						if (!templateRef) {
							throw new Error('Can not import service "TemplateRef" into directive "' + definition.name + '". Element "' + Dom.getReadableName(<Element>elementRef.nativeEl) + '" is not inside of any <template> element.');
						}

						return templateRef;
					},
				},
			},
		]);
	}

}
