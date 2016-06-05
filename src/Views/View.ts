import {AbstractView, ParametersList} from './AbstractView';
import {ControllerDefinition} from '../Entity/ControllerParser';
import {IBinding} from '../Templating/Binding/IBinding';
import {ElementRef} from '../Templating/ElementRef';
import {TemplateRef} from '../Templating/TemplateRef';
import {DirectiveDefinition} from '../Entity/DirectiveParser';
import {AbstractEntityView} from '../Entity/AbstractEntityView';
import {ControllerView} from '../Entity/ControllerView';
import {DirectiveView} from '../Entity/DirectiveView';
import {EmbeddedView} from './EmbeddedView';
import {ComponentMetadataDefinition} from './../Entity/Metadata';
import {Objects} from '../Util/Objects';
import {Arrays} from '../Util/Arrays';
import {Annotations} from '../Util/Annotations';
import {Functions} from '../Util/Functions';
import {SafeEval} from '../Util/SafeEval';
import {ExpressionParser, Expression} from '../Parsers/ExpressionParser';
import {TypeParser} from '../Parsers/TypeParser';
import {FilterMetadataDefinition} from '../Templating/Filters/Metadata';
import {ViewAware} from '../Templating/Filters/ViewAware';
import {Container} from '../DI/Container';


export class View extends AbstractView
{


	public el: ElementRef;

	public marker: Comment;

	public bindings: Array<IBinding> = [];

	public entities: Array<AbstractEntityView> = [];


	constructor(el: ElementRef, parameters: ParametersList = {}, parent?: AbstractView)
	{
		super(parent, parameters);

		this.el = el;
	}


	public static getByElement(el: ElementRef, parentView: View = null): View
	{
		return el.view ?
			el.view :
			el.view = parentView ? parentView.fork(el) : new View(el)
		;
	}


	public detach(): void
	{
		super.detach();

		for (let i = 0; i < this.bindings.length; i++) {
			this.bindings[i].detach();
		}

		for (let i = 0; i < this.entities.length; i++) {
			this.entities[i].detach();
		}

		this.entities = [];
	}


	public fork(el: ElementRef): View
	{
		let parameters = Objects.clone(this.parameters);

		let view = new View(el, parameters, this);

		view.filters = Objects.clone(this.filters);
		view.translations = Objects.clone(this.translations);

		return view;
	}


	public createEmbeddedView(templateRef: TemplateRef): EmbeddedView
	{
		let view = new EmbeddedView(this, templateRef);

		view.filters = Objects.clone(this.filters);
		view.parameters = Objects.clone(this.parameters);
		view.translations = Objects.clone(this.translations);

		view.attach(this.createMarker());

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
			let filter = filters[i];
			let filterMetadata: FilterMetadataDefinition = Annotations.getAnnotation(filter, FilterMetadataDefinition);

			if (!filterMetadata) {
				throw new Error('Filter ' + Functions.getName(filter) + ' is not valid filter, please add @Filter annotation.');
			}

			this.filters[filterMetadata.name] = container.create(filter);
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


	public attachBinding(binding: IBinding, expression: Expression): void
	{
		binding.attach();

		let hasOnChange = typeof binding['onChange'] === 'function';
		let hasOnUpdate = typeof binding['onUpdate'] === 'function';

		if (hasOnChange || hasOnUpdate) {
			if (hasOnUpdate) {
				binding['onUpdate'](ExpressionParser.parse(expression, this.parameters));
			}

			this.watch(expression, (changed) => {
				if (hasOnChange) {
					binding['onChange'](changed);
				}

				if (hasOnUpdate) {
					binding['onUpdate'](ExpressionParser.parse(expression, this.parameters));
				}
			});
		}

		this.bindings.push(binding);
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


	public createMarker(): Comment
	{
		if (this.marker) {
			return this.marker;
		}

		let el = this.el.nativeEl;
		let marker = document.createComment(' -slicky--data- ');

		el.parentNode.insertBefore(marker, el);

		return this.marker = marker;
	}


	public remove(): void
	{
		if (this.el.nativeEl.parentElement) {
			this.el.nativeEl.parentElement.removeChild(this.el.nativeEl);
		}
	}


	public applyFilters(value: string, expr: Expression): any
	{
		for (let i = 0; i < expr.filters.length; i++) {
			let filter = expr.filters[i];

			if (typeof this.filters[filter.name] === 'undefined') {
				throw new Error('Could not call filter "' + filter.name + '" in "' + expr.code + '" expression, filter is not registered.');
			}

			let args = [value];
			let filterInstance = this.filters[filter.name];

			for (let j = 0; j < filter.args.length; j++) {
				let arg = filter.args[j];
				args.push(arg.type === TypeParser.TYPE_PRIMITIVE ? arg.value : SafeEval.run('return ' + arg.value, this.parameters).result);
			}

			if (typeof filterInstance['onView'] === 'function') {
				(<ViewAware>filterInstance).onView(this);
			}

			value = filterInstance.transform.apply(filterInstance, args);
		}

		return value;
	}

}
