import {RenderableView} from '../Views/RenderableView';
import {Helpers} from '../Util/Helpers';
import {ExpressionParser} from '../Parsers/ExpressionParser';
import {ChangeDetectionStrategy, ExpressionDependencyType} from '../constants';
import {ParametersList, Expression, ExpressionDependency} from '../Interfaces';


declare interface WatcherItemDependency {
	expr: ExpressionDependency,
	previous: any,
	clone: any,
}

declare interface WatcherItem {
	listener: () => void,
	dependencies: Array<WatcherItemDependency>,
}


export class ChangeDetector
{


	public strategy: ChangeDetectionStrategy = ChangeDetectionStrategy.Default;

	private children: Array<ChangeDetector> = [];

	private parameters: ParametersList;

	private view: RenderableView;

	private watchers: {[id: number]: WatcherItem} = {};

	private watcherCounter: number = 0;

	private disabled: boolean = false;


	constructor(view: RenderableView, parent?: ChangeDetector)
	{
		if (parent) {
			parent.children.push(this);
		}

		this.view = view;
		this.parameters = view.parameters;
	}


	public disable(): void
	{
		this.disabled = true;
	}


	public watch(expr: Expression, allowCalls: boolean, listener: () => void): number
	{
		let dependencies = [];

		for (let i = 0; i < expr.dependencies.length; i++) {
			if (expr.dependencies[i].type === ExpressionDependencyType.Call && !allowCalls) {
				continue;
			}

			let previous = this.process(expr.dependencies[i]);
			let clone = Helpers.clone(previous);

			dependencies.push({
				expr: expr.dependencies[i],
				previous: previous,
				clone: clone,
			});
		}

		this.watchers[this.watcherCounter] = {
			listener: listener,
			dependencies: dependencies,
		};

		this.watcherCounter++;

		return this.watcherCounter - 1;
	}


	public unwatch(id: number): void
	{
		if (typeof this.watchers[id] === 'undefined') {
			return;
		}

		delete this.watchers[id];
	}


	public check(): void
	{
		if (this.disabled) {
			return;
		}

		for (let id in this.watchers) {
			if (this.watchers.hasOwnProperty(id)) {
				let watcher = this.watchers[id];

				if (this.checkWatcher(watcher)) {
					watcher.listener();
				}
			}
		}

		for (let i = 0; i < this.children.length; i++) {
			if (this.children[i].strategy === ChangeDetectionStrategy.Default) {
				this.children[i].check();
			}
		}
	}


	private checkWatcher(watcher: WatcherItem): boolean
	{
		for (let i = 0; i < watcher.dependencies.length; i++) {
			if (this.checkDependency(watcher.dependencies[i])) {
				return true;
			}
		}

		return false;
	}


	private checkDependency(dependency: WatcherItemDependency): boolean
	{
		let current = this.process(dependency.expr);

		// weak change detection
		if (current !== dependency.previous) {
			dependency.previous = current;
			dependency.clone = Helpers.clone(current);
			return true;

		// deep change detection
		} else {
			if (this.compare(current, dependency.clone)) {
				dependency.previous = current;
				dependency.clone = Helpers.clone(current);
				return true;
			}
		}

		return false;
	}


	private compare(a: any, b: any): boolean
	{
		if (Helpers.isObject(a)) {
			return this.compareObjects(a, b == null ? {} : b);

		} else if (Helpers.isArray(a)) {
			return this.compareArrays(a, b == null ? [] : b);
		}

		return false;
	}


	private compareObjects(a: any, b: any): boolean
	{
		for (let name in a) {
			if (a.hasOwnProperty(name)) {
				if (!b.hasOwnProperty(name)) {
					return true;

				} else if (b[name] !== a[name]) {
					return true;
				}
			}
		}

		for (let name in b) {
			if (b.hasOwnProperty(name) && !a.hasOwnProperty(name)) {
				return true;
			}
		}

		return false;
	}


	private compareArrays(a: Array<any>, b: Array<any>): boolean
	{
		for (let k = 0; k < a.length; k++) {
			if (typeof b[k] === 'undefined') {
				return true;

			} else if (b[k] !== a[k]) {
				return true;
			}
		}

		for (let k = 0; k < b.length; k++) {
			if (typeof a[k] === 'undefined') {
				return true;
			}
		}

		return false;
	}


	/**
	 * @todo pass list of allowed additional parameters ($this, $event)
	 */
	private process(expr: ExpressionDependency): any
	{
		try {
			return this.view.evalExpression(ExpressionParser.parse(expr.code), {}, true);
		} catch (e) {
			return undefined;
		}
	}

}
