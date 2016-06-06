import {Watcher, WatcherCallback} from '../Util/Watcher';
import {Annotations} from '../Util/Annotations';
import {Functions} from '../Util/Functions';
import {Expression} from '../Parsers/ExpressionParser';
import {FilterMetadataDefinition} from '../Templating/Filters/Metadata';
import {Container} from '../DI/Container';
import {TypeParser} from '../Parsers/TypeParser';
import {SafeEval} from '../Util/SafeEval';
import {ViewAware} from '../Templating/Filters/ViewAware';


export declare interface ParametersList
{
	[name: string]: any;
}


export abstract class AbstractView
{


	public watcher: Watcher;

	public parent: AbstractView;

	public children: Array<AbstractView> = [];

	public directives: Array<any> = [];

	public parameters: ParametersList = {};

	public filters: {[name: string]: any} = {};

	public translations: {[locale: string]: any} = {};


	constructor(parent?: AbstractView, parameters: ParametersList = {})
	{
		if (parent) {
			this.parent = parent;
			this.parent.children.push(this);
		}

		this.parameters = parameters;
		this.watcher = new Watcher(this.parameters, this.parent ? this.parent.watcher : null);
	}


	public detach(): void
	{
		for (let i = 0; i < this.children.length; i++) {
			this.children[i].detach();
		}

		this.watcher.stop();
	}


	public addParameter(name: string, value: any): void
	{
		if (typeof this.parameters[name] !== 'undefined') {
			throw new Error('Can not import variable ' + name + ' since its already in use.');
		}

		this.parameters[name] = value;
	}


	public addFilter(container: Container, filter: any): void
	{
		let metadata: FilterMetadataDefinition = Annotations.getAnnotation(filter, FilterMetadataDefinition);

		if (!metadata) {
			throw new Error('Filter ' + Functions.getName(filter) + ' is not valid filter, please add @Filter annotation.');
		}

		this.filters[metadata.name] = container.create(filter);
	}


	public watch(expr: Expression, cb: WatcherCallback): void
	{
		this.watcher.watch(expr, cb);
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

		let parent = this.parent;

		while (parent) {
			for (let i = 0; i < parent.directives.length; i++) {
				let directive = parent.directives[i];

				if (iterated.indexOf(directive) > -1) {
					continue;
				}

				iterated.push(directive);
				iterator(directive);
			}

			parent = parent.parent;
		}
	}


	public findFilter(name: string): any
	{
		if (typeof this.filters[name] !== 'undefined') {
			return this.filters[name];
		}

		if (this.parent) {
			return this.parent.findFilter(name);
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

}
