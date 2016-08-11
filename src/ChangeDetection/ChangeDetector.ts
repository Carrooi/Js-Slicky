import {ChangeDetectionStrategy, ChangeDetectionAction} from './constants';
import {Helpers} from '../Util/Helpers';
import {Code} from '../Util/Code';
import {Expression} from '../Parsers/ExpressionParser';
import {ParametersList, VariableToken, ChangedItem, ChangedDependency, ChangedDependencyProperty} from '../Interfaces';


declare interface WatcherItemDependency {
	expr: VariableToken,
	previous: any,
	clone: any,
}

declare interface WatcherItem {
	expr: Expression,
	listener: (ChangedItem) => void,
	dependencies: Array<WatcherItemDependency>,
}


export class ChangeDetector
{


	public strategy: ChangeDetectionStrategy = ChangeDetectionStrategy.Default;

	private children: Array<ChangeDetector> = [];

	private parameters: ParametersList;

	private watchers: Array<WatcherItem> = [];

	private disabled: boolean = false;


	constructor(parameters: ParametersList, parent?: ChangeDetector)
	{
		if (parent) {
			parent.children.push(this);
		}

		this.parameters = parameters;
	}


	public disable(): void
	{
		this.disabled = true;
	}


	public watch(expr: Expression, listener: (changed: ChangedItem) => void): void
	{
		let dependencies = [];

		for (let i = 0; i < expr.dependencies.length; i++) {
			let previous = this.interpolate(expr.dependencies[i]);
			let clone = Helpers.clone(previous);

			dependencies.push({
				expr: expr.dependencies[i],
				previous: previous,
				clone: clone,
			});
		}

		this.watchers.push({
			expr: expr,
			listener: listener,
			dependencies: dependencies,
		});
	}


	public check(): void
	{
		if (this.disabled) {
			return;
		}

		for (let i = 0; i < this.watchers.length; i++) {
			let watcher = this.watchers[i];
			let changed = this.checkWatcher(watcher);

			if (changed.action !== ChangeDetectionAction.Same) {
				watcher.listener(changed);
			}
		}

		for (let i = 0; i < this.children.length; i++) {
			if (this.children[i].strategy === ChangeDetectionStrategy.Default) {
				this.children[i].check();
			}
		}
	}


	private checkWatcher(watcher: WatcherItem): ChangedItem
	{
		let changed = {
			action: ChangeDetectionAction.Same,
			dependencies: [],
		};

		for (let i = 0; i < watcher.dependencies.length; i++) {
			let dependency = watcher.dependencies[i];
			let changes = this.checkDependency(dependency);

			if (changes.action !== ChangeDetectionAction.Same) {
				changed.action = ChangeDetectionAction.DeepUpdate;
				changed.dependencies.push(changes);
			}
		}

		return changed;
	}


	private checkDependency(dependency: WatcherItemDependency): ChangedDependency
	{
		let current = this.interpolate(dependency.expr);
		let changes = {
			action: ChangeDetectionAction.Same,
			expr: dependency.expr,
			props: [],
		};

		// weak change detection
		if (current !== dependency.previous) {
			changes.action = ChangeDetectionAction.Update;

		// deep change detection
		} else {
			let props = this.compare(current, dependency.clone);
			if (props.length) {
				changes.action = ChangeDetectionAction.DeepUpdate;
				changes.props = props;
			}
		}

		if (changes.action !== ChangeDetectionAction.Same) {
			dependency.previous = current;
			dependency.clone = Helpers.clone(current);
		}

		return changes;
	}


	private compare(a: any, b: any): Array<ChangedDependencyProperty>
	{
		if (Helpers.isObject(a)) {
			return this.compareObjects(a, b == null ? {} : b);

		} else if (Helpers.isArray(a)) {
			return this.compareArrays(a, b == null ? [] : b);
		}

		return [];
	}


	private compareObjects(a: any, b: any): Array<ChangedDependencyProperty>
	{
		let result = [];

		for (let name in a) {
			if (a.hasOwnProperty(name)) {
				if (!b.hasOwnProperty(name)) {
					result.push({
						property: name,
						action: ChangeDetectionAction.Add,
						newValue: a[name],
						oldValue: undefined,
					});

				} else if (b[name] !== a[name]) {
					result.push({
						property: name,
						action: ChangeDetectionAction.Update,
						newValue: a[name],
						oldValue: b[name],
					});
				}
			}
		}

		for (let name in b) {
			if (b.hasOwnProperty(name) && !a.hasOwnProperty(name)) {
				result.push({
					property: name,
					action: ChangeDetectionAction.Remove,
					newValue: undefined,
					oldValue: b[name],
				});
			}
		}

		return result;
	}


	private compareArrays(a: Array<any>, b: Array<any>): Array<ChangedDependencyProperty>
	{
		let result = [];

		for (let k = 0; k < a.length; k++) {
			if (typeof b[k] === 'undefined') {
				result.push({
					property: k,
					action: ChangeDetectionAction.Add,
					newValue: a[k],
					oldValue: undefined,
				});

			} else if (b[k] !== a[k]) {
				result.push({
					property: k,
					action: ChangeDetectionAction.Update,
					newValue: a[k],
					oldValue: b[k],
				});
			}
		}

		for (let k = 0; k < b.length; k++) {
			if (typeof a[k] === 'undefined') {
				result.push({
					property: k,
					action: ChangeDetectionAction.Remove,
					newValue: undefined,
					oldValue: b[k],
				});
			}
		}

		return result;
	}


	private interpolate(expr: VariableToken): any
	{
		let result = Code.interpolateObjectElement(this.parameters, expr);
		return result.obj[result.key];
	}

}
