import {AbstractView, ParametersList} from './AbstractView';
import {ControllerDefinition} from './../Entity/ControllerParser';
import {IBinding} from './../Templating/Binding/IBinding';
import {ElementRef} from './../Templating/ElementRef';
import {TemplateRef} from './../Templating/TemplateRef';
import {DirectiveDefinition} from './../Entity/DirectiveParser';
import {AbstractEntityView} from './../Entity/AbstractEntityView';
import {ControllerView} from './../Entity/ControllerView';
import {DirectiveView} from './../Entity/DirectiveView';
import {EmbeddedView} from './EmbeddedView';
import {ComponentMetadataDefinition} from './../Entity/Metadata';
import {Objects} from './../Util/Objects';
import {Arrays} from './../Util/Arrays';
import {ExpressionParser} from '../Templating/Parsers/ExpressionParser';


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
		view.directives = Arrays.clone(this.directives);

		return view;
	}


	public createEmbeddedView(templateRef: TemplateRef): EmbeddedView
	{
		let view = new EmbeddedView(this, templateRef);

		view.filters = Objects.clone(this.filters);
		view.directives = Arrays.clone(this.directives);
		view.parameters = Objects.clone(this.parameters);

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


	public updateWithController(definition: ControllerDefinition): void
	{
		let directives = definition.metadata.directives;
		let filters = definition.metadata.filters;

		for (let i = 0; i < directives.length; i++) {
			if (this.directives.indexOf(directives[i]) < 0) {
				this.directives.push(directives[i]);
			}
		}

		for (let name in filters) {
			if (filters.hasOwnProperty(name)) {
				this.filters[name] = filters[name];
			}
		}
	}


	public attachBinding(binding: IBinding, expression: string): void
	{
		binding.attach();

		let hasOnChange = typeof binding['onChange'] === 'function';
		let hasOnUpdate = typeof binding['onUpdate'] === 'function';

		if (hasOnChange || hasOnUpdate) {
			let expr = ExpressionParser.precompile(expression);

			if (hasOnUpdate) {
				binding['onUpdate'](ExpressionParser.parse(expr, this.parameters, this.filters));
			}

			this.watch(expr, (changed) => {
				if (hasOnChange) {
					binding['onChange'](changed);
				}

				if (hasOnUpdate) {
					binding['onUpdate'](ExpressionParser.parse(expr, this.parameters, this.filters));
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

}
