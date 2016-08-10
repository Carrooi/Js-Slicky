import {AbstractView} from './AbstractView';
import {ControllerDefinition} from '../Entity/ControllerParser';
import {DirectiveDefinition} from '../Entity/DirectiveParser';
import {ComponentInstance} from '../Entity/ComponentInstance';
import {DirectiveInstance} from '../Entity/DirectiveInstance';
import {ElementRef} from '../Templating/ElementRef';
import {TemplateRef} from '../Templating/TemplateRef';
import {ChangeDetector} from '../ChangeDetection/ChangeDetector';
import {ChangeDetectorRef} from '../ChangeDetection/ChangeDetectorRef';
import {ChangeDetectionStrategy} from '../ChangeDetection/ChangeDetectionStrategy';
import {ApplicationView} from './ApplicationView';
import {EmbeddedView} from './EmbeddedView';
import {Helpers} from '../Util/Helpers';
import {Dom} from '../Util/Dom';
import {Container} from '../DI/Container';
import {IBinding} from '../Templating/Binding/IBinding';
import {ExpressionParser, Expression} from '../Parsers/ExpressionParser';
import {ViewAware} from '../Templating/Filters/ViewAware';
import {TypeParser} from '../Parsers/TypeParser';
import {SafeEval} from '../Util/SafeEval';
import {FilterMetadataDefinition} from '../Templating/Filters/Metadata';
import {Annotations} from '../Util/Annotations';
import {Functions} from '../Util/Functions';
import {Realm} from '../Util/Realm';
import {ParametersList, WatcherCallback} from '../Interfaces';


export class ComponentView extends AbstractView
{


	public parent: ComponentView|ApplicationView;

	public el: ElementRef;

	public realm: Realm;

	public changeDetector: ChangeDetector;

	public changeDetectorRef: ChangeDetectorRef;

	public changeDetectionStrategy: ChangeDetectionStrategy = ChangeDetectionStrategy.Default;

	public directives: Array<any> = [];

	public translations: {[locale: string]: any} = {};

	public filters: {[name: string]: any} = {};

	public parameters: ParametersList = {};

	public component: ComponentInstance = null;

	public attachedDirectives: Array<DirectiveInstance> = [];

	public bindings: Array<IBinding> = [];

	public templates: {[id: string]: TemplateRef} = {};


	constructor(parent: ComponentView|ApplicationView, el: ElementRef, parameters: ParametersList = {})
	{
		super(parent);

		this.el = el;
		this.el.view = this;
		this.parameters = parameters;

		this.changeDetector = new ChangeDetector(
			this.parameters,
			this.parent.changeDetector
		);

		this.changeDetectorRef = new ChangeDetectorRef(() => {
			this.changeDetector.check();
		});

		this.realm = new Realm(this.parent.realm, null, () => {
			if (this.changeDetectionStrategy === ChangeDetectionStrategy.Default) {
				this.changeDetectorRef.refresh();
			}
		});
	}


	public detach(): void
	{
		super.detach();

		this.changeDetector.disable();

		this.run(() => {
			for (let i = 0; i < this.attachedDirectives.length; i++) {
				this.attachedDirectives[i].detach();
			}

			if (this.component) {
				this.component.detach();
				this.component = null;
			}

			for (let i = 0; i < this.bindings.length; i++) {
				this.bindings[i].detach();
			}

			this.attachedDirectives = [];
		});
	}


	public fork(el: ElementRef): ComponentView
	{
		if (el.view) {
			return el.view;
		}

		let parameters = Helpers.clone(this.parameters);
		let translations = Helpers.clone(this.translations);

		let view = new ComponentView(this, el, parameters);
		view.translations = translations;
		view.changeDetectionStrategy = this.changeDetectionStrategy;

		return view;
	}


	public addParameter(name: string, value: any): void
	{
		if (typeof this.parameters[name] !== 'undefined') {
			throw new Error('Can not import variable ' + name + ' since its already in use.');
		}

		this.parameters[name] = value;
	}


	public addParameters(parameters: ParametersList): void
	{
		for (let name in parameters) {
			if (parameters.hasOwnProperty(name)) {
				this.addParameter(name, parameters[name]);
			}
		}
	}


	public watch(expr: Expression, cb: WatcherCallback): void
	{
		this.changeDetector.watch(expr, cb);
	}


	public run(fn: () => void): any
	{
		return this.realm.run(fn);
	}


	public eachDirective(iterator: (directive: any) => void): void
	{
		let iterated = [];

		for (let i = 0; i < this.directives.length; i++) {
			let directive = this.directives[i];

			if (iterated.indexOf(directive) > -1) {
				continue;
			}

			iterated.push(directive);
			iterator(directive);
		}

		let parent: ComponentView = <any>this.parent;

		while (parent && parent instanceof ComponentView) {
			for (let i = 0; i < parent.directives.length; i++) {
				let directive = parent.directives[i];

				if (iterated.indexOf(directive) > -1) {
					continue;
				}

				iterated.push(directive);
				iterator(directive);
			}

			parent = <any>parent.parent;
		}
	}


	public createEmbeddedView(templateRef: TemplateRef): EmbeddedView
	{
		let view = new EmbeddedView(this, templateRef);
		view.attach();

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


	public createDirectiveInstance(container: Container, definition: DirectiveDefinition, elementRef: ElementRef, templateRef?: TemplateRef): any
	{
		return container.create(<any>definition.directive, [
			{
				service: ElementRef,
				options: {
					useFactory: () => elementRef,
				},
			},
			{
				service: ComponentView,
				options: {
					useFactory: () => this,
				},
			},
			{
				service: ChangeDetectorRef,
				options: {
					useFactory: () => this.changeDetectorRef,
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


	public setComponent(container: Container, definition: ControllerDefinition, component: any, controllerName?: string): ComponentInstance
	{
		if (this.component) {
			throw new Error('Can\'t attach component "' + definition.name + '" to element "' + Dom.getReadableName(<Element>this.el.nativeEl) + '" since it\'s already attached to component "' + this.component.definition.name + '".');
		}

		this.component = new ComponentInstance(this, definition, component);

		this.changeDetectionStrategy = definition.metadata.changeDetection;

		let directives = definition.metadata.directives;
		let filters = definition.metadata.filters;
		let translations = definition.metadata.translations;

		if (controllerName || definition.metadata.controllerAs) {
			this.addParameter(controllerName ? controllerName : definition.metadata.controllerAs, component);
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

		return this.component;
	}


	public attachDirective(definition: DirectiveDefinition, instance: any, el: Element): DirectiveInstance
	{
		let result = new DirectiveInstance(this, definition, instance, el);
		this.attachedDirectives.push(result);

		return result;
	}


	public attachBinding(binding: IBinding, expression: Expression): void
	{
		this.run(() => binding.attach());

		let hasOnChange = typeof binding['onChange'] === 'function';
		let hasOnUpdate = typeof binding['onUpdate'] === 'function';

		if (hasOnChange || hasOnUpdate) {
			if (hasOnUpdate) {
				this.run(() => binding['onUpdate'](ExpressionParser.parse(expression, this.parameters)));
			}

			this.watch(expression, (changed) => {
				if (hasOnChange) {
					this.run(() => binding['onChange'](changed));

				}

				if (hasOnUpdate) {
					this.run(() => binding['onUpdate'](ExpressionParser.parse(expression, this.parameters)));
				}
			});
		}

		this.bindings.push(binding);
	}


	public addFilter(container: Container, filter: any): void
	{
		let metadata: FilterMetadataDefinition = Annotations.getAnnotation(filter, FilterMetadataDefinition);

		if (!metadata) {
			throw new Error('Filter ' + Functions.getName(filter) + ' is not valid filter, please add @Filter annotation.');
		}

		this.filters[metadata.name] = container.create(filter);
	}


	public findFilter(name: string): any
	{
		if (typeof this.filters[name] !== 'undefined') {
			return this.filters[name];
		}

		if (this.parent instanceof ComponentView) {
			return (<ComponentView>this.parent).findFilter(name);
		}

		return null;
	}


	public applyFilters(value: string, expr: Expression): any
	{
		for (let i = 0; i < expr.filters.length; i++) {
			let filter = expr.filters[i];
			let filterInstance = this.findFilter(filter.name);

			if (!filterInstance) {
				throw new Error('Could not call filter "' + filter.name + '" in "' + expr.code + '" expression, filter is not registered.');
			}

			let args = [value];

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


	public storeTemplate(template: TemplateRef): void
	{
		this.templates[template.getId()] = template;
	}


	public findTemplate(id: string): TemplateRef
	{
		if (typeof this.templates[id] === 'undefined') {
			return null;
		}

		return this.templates[id];
	}

}
