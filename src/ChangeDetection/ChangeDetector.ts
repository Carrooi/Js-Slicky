import {Helpers} from '../Util/Helpers';
import {Expression} from '../Parsers/ExpressionParser';
import {ParametersList, WatcherListener, WatcherCallback, ChangedProperty} from '../Interfaces';


export class ChangeDetector
{


	private children: Array<ChangeDetector> = [];

	private parameters: ParametersList;

	private listeners: Array<WatcherListener> = [];

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


	public watch(expr: Expression, cb: WatcherCallback): void
	{
		let dependencies = [];

		mainLoop: for (let i = 0; i < expr.dependencies.length; i++) {
			let dependency = expr.dependencies[i];
			let scope = this.parameters[dependency.name];

			if (scope == null) {
				continue;
			}

			let clones = {};
			let obj = null;

			clones[dependency.name] = scope;

			if (!dependency.path.length) {
				obj = Helpers.clone(scope);
			} else {
				for (let j = 0; j < dependency.path.length; j++) {
					let key = dependency.path[j].value;
					let isLast = j === (dependency.path.length - 1);

					if (typeof scope[key] === 'undefined' && !isLast) {
						continue mainLoop;
					}

					clones[key] = scope[key];
					scope = scope[key];

					if (isLast) {
						obj = Helpers.clone(scope);
					}
				}
			}

			dependencies.push({
				clones: clones,
				obj: obj,
				dependency: dependency,
			});
		}

		this.listeners.push({
			dependencies: dependencies,
			cb: cb,
		});
	}


	public check(): void
	{
		if (this.disabled) {
			return;
		}

		for (let i = 0; i < this.listeners.length; i++) {
			let listener = this.listeners[i];
			let changed = [];

			for (let j = 0; j < listener.dependencies.length; j++) {
				let notify = false;
				let props = [];

				let data = listener.dependencies[j];

				let dependency = data.dependency;
				let _previous = data.clones[dependency.name];
				let _current = this.parameters[dependency.name];

				if (_current == null || _previous == null) {
					continue;
				}

				if (_current !== _previous) {
					notify = true;
					data.obj = Helpers.clone(_current);
					data.clones[dependency.name] = _current;
				} else if (dependency.path.length) {
					for (let k = 0; k < dependency.path.length; k++) {
						let key = dependency.path[k].value;
						let isLast = k === (dependency.path.length - 1);

						_previous = data.clones[key];
						_current = _current[key];

						if (_previous !== _current) {
							data.clones[key] = _current;
							notify = true;

						} else if (isLast) {
							let currentProps = this.compare(_current, data.obj);
							if (currentProps.length) {
								notify = true;
								props = props.concat(currentProps);
							}
						}

						if (notify && isLast) {
							data.obj = Helpers.clone(_current);
						}
					}
				} else {
					let currentProps = this.compare(_current, data.obj);
					if (currentProps.length) {
						notify = true;
						props = props.concat(currentProps);
						data.obj = Helpers.clone(_current);
					}
				}

				if (notify) {
					changed.push({
						expr: dependency.code,
						props: props.length ? props : null,
					});
				}
			}

			if (changed.length) {
				listener.cb(<any>changed);
			}
		}

		for (let i = 0; i < this.children.length; i++) {
			this.children[i].check();
		}
	}


	private compare(a: any, b: any): Array<ChangedProperty>
	{
		if (Helpers.isObject(a)) {
			return this.compareObjects(a, b == null ? {} : b);

		} else if (Helpers.isArray(a)) {
			return this.compareArrays(a, b == null ? [] : b);
		}

		return [];
	}


	private compareObjects(a: any, b: any): Array<ChangedProperty>
	{
		let result = [];

		for (let name in a) {
			if (a.hasOwnProperty(name)) {
				if (!b.hasOwnProperty(name)) {
					result.push({
						prop: name,
						action: 'add',
						newValue: a[name],
						oldValue: undefined,
					});

				} else if (b[name] !== a[name]) {
					result.push({
						prop: name,
						action: 'change',
						newValue: a[name],
						oldValue: b[name],
					});
				}
			}
		}

		for (let name in b) {
			if (b.hasOwnProperty(name) && !a.hasOwnProperty(name)) {
				result.push({
					prop: name,
					action: 'remove',
					newValue: undefined,
					oldValue: b[name],
				});
			}
		}

		return result;
	}


	private compareArrays(a: Array<any>, b: Array<any>): Array<ChangedProperty>
	{
		let result = [];

		for (let k = 0; k < a.length; k++) {
			if (typeof b[k] === 'undefined') {
				result.push({
					prop: k,
					action: 'add',
					newValue: a[k],
					oldValue: undefined,
				});

			} else if (b[k] !== a[k]) {
				result.push({
					prop: k,
					action: 'change',
					newValue: a[k],
					oldValue: b[k],
				});
			}
		}

		for (let k = 0; k < b.length; k++) {
			if (typeof a[k] === 'undefined') {
				result.push({
					prop: k,
					action: 'remove',
					newValue: undefined,
					oldValue: b[k],
				});
			}
		}

		return result;
	}

}
