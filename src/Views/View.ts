import {AbstractView, ParametersList} from './AbstractView';
import {ControllerDefinition} from '../Entity/ControllerParser';
import {ElementRef} from '../Templating/ElementRef';
import {TemplateRef} from '../Templating/TemplateRef';
import {DirectiveDefinition} from '../Entity/DirectiveParser';
import {AbstractEntityView} from '../Entity/AbstractEntityView';
import {ControllerView} from '../Entity/ControllerView';
import {DirectiveView} from '../Entity/DirectiveView';
import {EmbeddedView} from './EmbeddedView';
import {ComponentMetadataDefinition} from './../Entity/Metadata';
import {Helpers} from '../Util/Helpers';
import {Container} from '../DI/Container';


export class View extends AbstractView
{


	public el: ElementRef;

	public entities: Array<AbstractEntityView> = [];


	constructor(el: ElementRef, parameters: ParametersList = {}, parent?: AbstractView)
	{
		super(parent, parameters);

		this.el = el;
		this.el.view = this;
	}


	public detach(): void
	{
		super.detach();

		for (let i = 0; i < this.entities.length; i++) {
			this.entities[i].detach();
		}

		this.entities = [];
	}


	public fork(el: ElementRef): View
	{
		let parameters = Helpers.clone(this.parameters);
		let translations = Helpers.clone(this.translations);

		let view = new View(el, parameters, this);
		view.translations = translations;

		return view;
	}


	public createEmbeddedView(templateRef: TemplateRef): EmbeddedView
	{
		let view = new EmbeddedView(this, templateRef);

		view.parameters = Helpers.clone(this.parameters);
		view.translations = Helpers.clone(this.translations);

		view.attach(templateRef.el.createMarker());

		return view;
	}


	public removeEmbeddedView(view: EmbeddedView): void
	{
		for (let i = 0; i < this.children.length; i++) {
			if (this.children[i] === view) {
				view.detach();

				this.children.splice(i, 1);

				return;
			}
		}
	}


	public updateWithController(container: Container, definition: ControllerDefinition): void
	{
		let directives = definition.metadata.directives;
		let filters = definition.metadata.filters;
		let translations = definition.metadata.translations;

		for (let i = 0; i < directives.length; i++) {
			this.directives.push(directives[i]);
		}

		for (let i = 0; i < filters.length; i++) {
			this.addFilter(container, filters[i]);
		}
		
		for (let locale in translations) {
			if (translations.hasOwnProperty(locale)) {
				if (typeof this.translations[locale] === 'undefined') {
					this.translations[locale] = {};
				}

				for (let groupName in translations[locale]) {
					if (translations[locale].hasOwnProperty(groupName)) {
						this.translations[locale][groupName] = translations[locale][groupName];
					}
				}
			}
		}
	}


	public attachDirective(definition: DirectiveDefinition, instance: any): void
	{
		let entity = definition.metadata instanceof ComponentMetadataDefinition ?
			new ControllerView(this, this.el, <ControllerDefinition>definition, instance) :
			new DirectiveView(this, this.el, definition, instance)
		;

		this.entities.push(entity);

		(<AbstractEntityView>entity).attach();
	}

}
