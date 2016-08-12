import {Container} from './DI/Container';
import {DirectiveDefinition} from './Entity/DirectiveParser';
import {ControllerDefinition} from './Entity/ControllerParser';
import {ComponentMetadataDefinition} from './Entity/Metadata';
import {DirectiveInstance} from './Entity/DirectiveInstance'
import {ComponentInstance} from './Entity/ComponentInstance'
import {ElementRef} from './Templating/ElementRef';
import {TemplateRef} from './Templating/TemplateRef';
import {ChangeDetectorRef} from './ChangeDetection/ChangeDetectorRef'
import {ViewFactory} from './Views/ViewFactory';
import {RenderableView} from './Views/RenderableView';
import {ComponentView} from './Views/ComponentView';
import {Dom} from './Util/Dom';
import {ChangeDetectionStrategy} from "./ChangeDetection/constants";


export class DirectiveFactory
{


	private container: Container;

	private viewFactory: ViewFactory;


	constructor(container: Container, viewFactory: ViewFactory)
	{
		this.container = container;
		this.viewFactory = viewFactory;
	}


	public create(view: RenderableView, definition: DirectiveDefinition, elementRef: ElementRef, templateRef?: TemplateRef): DirectiveInstance
	{
		if (definition.metadata instanceof ComponentMetadataDefinition) {
			let parentChangeDetection = view.changeDetector.strategy;
			let changeDetection = (<ControllerDefinition>definition).metadata.changeDetection;

			view = this.viewFactory.createComponentView(view, elementRef);
			view.changeDetector.strategy = changeDetection === null ? parentChangeDetection : changeDetection;
		}

		let instance = this.createInstance(view, definition, elementRef, templateRef);
		let el = <Element>elementRef.nativeEl;
		let entity: DirectiveInstance = null;

		if (definition.metadata instanceof ComponentMetadataDefinition) {
			entity = new ComponentInstance(<ComponentView>view, <ControllerDefinition>definition, instance);
		} else {
			entity = new DirectiveInstance(view, definition, instance, el);
		}

		return entity;
	}


	public createInstance(view: RenderableView, definition: DirectiveDefinition, elementRef: ElementRef, templateRef?: TemplateRef): any
	{
		return this.container.create(<any>definition.directive, [
			{
				service: ElementRef,
				options: {
					useFactory: () => elementRef,
				},
			},
			{
				service: RenderableView,
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
