import {Watcher, WatcherCallback} from '../Util/Watcher';
import {Expression} from '../Parsers/ExpressionParser';
import {DefaultFilters} from './../Templating/Filters/DefaultFilters';


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

	public filters: {[name: string]: any} = DefaultFilters;

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


	public watch(expr: Expression, cb: WatcherCallback): void
	{
		this.watcher.watch(expr, cb);
	}

}
