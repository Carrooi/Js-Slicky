import {AbstractView, ParametersList} from './AbstractView';
import {ControllerDefinition} from '../Entity/ControllerParser';
import {ElementRef} from '../Templating/ElementRef';
import {TemplateRef} from '../Templating/TemplateRef';
import {EmbeddedView} from './EmbeddedView';
import {Helpers} from '../Util/Helpers';
import {Dom} from '../Util/Dom';
import {Functions} from '../Util/Functions';
import {Container} from '../DI/Container';
import {OnDestroy} from '../Interfaces';


export class ComponentView extends AbstractView
{


	public el: ElementRef;

	public component: {definition: ControllerDefinition, instance: any} = null;

	public attachedDirectives: Array<any> = [];


	constructor(el: ElementRef, parameters: ParametersList = {}, parent?: AbstractView)
	{
		super(parent, parameters);

		this.el = el;
		this.el.view = this;
	}


	public detach(): void
	{
		super.detach();

		for (let i = 0; i < this.attachedDirectives.length; i++) {
			if (typeof this.attachedDirectives[i]['onDestroy'] === 'function') {
				(<OnDestroy>this.attachedDirectives[i]).onDestroy();
			}

			this.attachedDirectives[i].detach();
		}

		if (this.component && typeof this.component.instance['onDestroy'] === 'function') {
			(<OnDestroy>this.component.instance).onDestroy();
			this.component = null;
		}

		this.attachedDirectives = [];
	}


	public fork(el: ElementRef): ComponentView
	{
		if (el.view) {
			return el.view;
		}

		let parameters = Helpers.clone(this.parameters);
		let translations = Helpers.clone(this.translations);

		let view = new ComponentView(el, parameters, this);
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


	public setComponent(container: Container, definition: ControllerDefinition, component: any): void
	{
		if (this.component) {
			throw new Error('Can\'t attach component "' + definition.name + '" to element "' + Dom.getReadableName(<Element>this.el.nativeEl) + '" since it\'s already attached to component "' + this.component.definition.name + '".');
		}

		this.component = {
			definition: definition,
			instance: component,
		};

		let directives = definition.metadata.directives;
		let filters = definition.metadata.filters;
		let translations = definition.metadata.translations;

		if (definition.metadata.controllerAs) {
			this.addParameter(definition.metadata.controllerAs, component);
		}

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


	public attachDirective(instance: any): void
	{
		this.attachedDirectives.push(instance);
	}

}
