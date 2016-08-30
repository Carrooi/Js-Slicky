import {AbstractView} from './AbstractView';
import {DirectiveInstance} from '../Entity/DirectiveInstance';
import {ElementRef} from '../Templating/ElementRef';
import {TemplateRef} from '../Templating/TemplateRef';
import {ChangeDetector} from '../ChangeDetection/ChangeDetector';
import {ChangeDetectorRef} from '../ChangeDetection/ChangeDetectorRef';
import {ChangeDetectionStrategy} from '../constants';
import {ApplicationView} from './ApplicationView';
import {Container} from '../DI/Container';
import {IBinding} from '../Templating/Binding/IBinding';
import {ExpressionParser} from '../Parsers/ExpressionParser';
import {ViewAware} from '../Templating/Filters/ViewAware';
import {SafeEval} from '../Util/SafeEval';
import {FilterMetadataDefinition} from '../Templating/Filters/Metadata';
import {Annotations} from '../Util/Annotations';
import {Functions} from '../Util/Functions';
import {Realm} from '../Util/Realm';
import {ParametersList, ChangedItem, Expression} from '../Interfaces';


export abstract class RenderableView extends AbstractView
{


	public container: Container;

	public parent: RenderableView|ApplicationView;

	public el: ElementRef;

	public realm: Realm;

	public changeDetector: ChangeDetector;

	public changeDetectorRef: ChangeDetectorRef;

	public directives: Array<any> = [];

	public translations: {[locale: string]: any} = {};

	public filters: {[name: string]: any} = {};

	public parameters: ParametersList = {};

	public attachedDirectives: Array<DirectiveInstance> = [];

	public bindings: Array<IBinding> = [];

	public templates: {[id: string]: TemplateRef} = {};


	constructor(container: Container, el: ElementRef, parent?: RenderableView, parameters: ParametersList = {})
	{
		super(parent);

		this.container = container;
		this.el = el;
		this.el.view = this;
		this.parameters = parameters;

		this.changeDetector = new ChangeDetector(
			this,
			this.parent ? this.parent.changeDetector : null
		);

		this.changeDetectorRef = new ChangeDetectorRef(() => {
			this.changeDetector.check();
		});

		this.realm = new Realm(this.parent ? this.parent.realm : null, null, () => {
			if (this.changeDetector.strategy === ChangeDetectionStrategy.Default) {
				this.changeDetectorRef.refresh();
			}
		});
	}


	public detach(): void
	{
		super.detach();

		this.changeDetector.disable();

		for (let i = 0; i < this.attachedDirectives.length; i++) {
			((directive: DirectiveInstance) => {
				this.run(() => directive.detach());
			})(this.attachedDirectives[i]);
		}

		for (let i = 0; i < this.bindings.length; i++) {
			((binding: IBinding) => {
				this.run(() => binding.detach());
			})(this.bindings[i]);
		}

		this.attachedDirectives = [];
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


	public findParameter(name: string): any
	{
		let view: RenderableView = this;

		while (view) {
			if (typeof view.parameters[name] !== 'undefined') {
				return view.parameters[name];
			}

			view = view.parent;
		}

		return undefined;
	}


	public watch(expr: Expression, allowCalls: boolean, listener: (changed: ChangedItem) => void): number
	{
		return this.changeDetector.watch(expr, allowCalls, listener);
	}


	public run(fn: () => void): any
	{
		return this.realm.run(fn);
	}


	public eval(code: string, parameters: {[name: string]: any} = {}): any
	{
		return this.evalExpression(ExpressionParser.parse(code), parameters);
	}


	public evalExpression(expr: Expression, parameters: {[name: string]: any} = {}, autoReturn: boolean = false): any
	{
		let scope = {};
		let instantiate = [];
		let exports = [];

		for (let i = 0; i < expr.dependencies.length; i++) {
			let dependency = expr.dependencies[i];
			let root = dependency.root;

			if (typeof parameters[root] !== 'undefined') {
				scope[root] = parameters[root];
			} else {
				scope[root] = this.findParameter(root);
			}

			if (dependency.exportable) {
				exports.push(root);
			}

			if (typeof scope[root] === 'undefined') {
				instantiate.push(root);
			}
		}

		let code = autoReturn ? 'return ' + expr.code : expr.code;
		let result = SafeEval.run(code, scope, {instantiate: instantiate, exports: exports});

		for (let exportVar in result.exports) {
			if (result.exports.hasOwnProperty(exportVar)) {
				this.addParameter(exportVar, result.exports[exportVar]);
			}
		}

		return this.applyFilters(result.result, expr);

		//return result.result;
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

		let parent: RenderableView = <any>this.parent;

		while (parent && parent instanceof RenderableView) {
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


	public removeChildView(view: RenderableView): void
	{
		for (let i = 0; i < this.children.length; i++) {
			if (this.children[i] === view) {
				view.detach();

				this.children.splice(i, 1);

				return;
			}
		}
	}


	public attachDirective(instance: DirectiveInstance): void
	{
		this.attachedDirectives.push(instance);
	}


	public attachBinding(binding: IBinding, allowCheckCalls: boolean, expression: Expression): void
	{
		this.run(() => binding.attach());

		let hasOnChange = typeof binding['onChange'] === 'function';
		let hasOnUpdate = typeof binding['onUpdate'] === 'function';

		if (hasOnChange || hasOnUpdate) {
			if (hasOnUpdate) {
				this.run(() => binding['onUpdate'](this.evalExpression(expression, {}, true)));
			}

			this.watch(expression, allowCheckCalls, (changed: ChangedItem) => {
				if (hasOnChange) {
					this.run(() => binding['onChange'](changed));
				}

				if (hasOnUpdate) {
					this.run(() => binding['onUpdate'](this.evalExpression(expression, {}, true)));
				}
			});
		}

		this.bindings.push(binding);
	}


	public addFilter(filter: any): void
	{
		let metadata: FilterMetadataDefinition = Annotations.getAnnotation(filter, FilterMetadataDefinition);

		if (!metadata) {
			throw new Error('Filter ' + Functions.getName(filter) + ' is not valid filter, please add @Filter annotation.');
		}

		this.filters[metadata.name] = this.container.create(filter);
	}


	public findFilter(name: string): any
	{
		if (typeof this.filters[name] !== 'undefined') {
			return this.filters[name];
		}

		if (this.parent instanceof RenderableView) {
			return (<RenderableView>this.parent).findFilter(name);
		}

		return null;
	}


	public applyFilters(value: string, expr: Expression): any
	{
		for (let i = 0; i < expr.filters.length; i++) {
			let filter = expr.filters[i];
			let filterInstance = this.findFilter(filter.name);

			if (!filterInstance) {
				throw new Error('Could not call filter "' + filter.name + '" on "' + expr.code + '" expression because filter is not registered.');
			}

			let args = [value];

			for (let j = 0; j < filter.arguments.length; j++) {
				args.push(this.evalExpression(filter.arguments[j], {}, true));
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
