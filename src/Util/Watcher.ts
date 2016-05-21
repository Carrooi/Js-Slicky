import {ParametersList} from '../Views/AbstractView';
import {Expression} from '../Parsers/ExpressionParser';
import {Code, InterpolatedObjectElement} from './Code';
import {Helpers} from './Helpers';
import {Objects} from './Objects';
import {Arrays} from './Arrays';


declare interface ChangedProperty
{
	prop: string,
	action: string,
	newValue: any,
	oldValue: any,
}

export declare interface ChangedObject
{
	expr: string,
	props?: Array<ChangedProperty>,
}

export declare interface WatcherCallback
{
	(changed: Array<ChangedObject>): void,
}

declare interface WatcherDependency
{
	dependency: InterpolatedObjectElement,
	expr: string,
	previous: any,
	copy: any,
}

declare interface WatcherListener
{
	dependencies: Array<WatcherDependency>,
	cb: WatcherCallback,
}


export class Watcher
{


	private static INTERVAL = 50;


	private parent: Watcher;

	private children: Array<Watcher> = [];

	private parameters: ParametersList;

	private listeners: Array<WatcherListener> = [];

	private running: boolean = false;


	constructor(parameters: ParametersList, parent?: Watcher)
	{
		if (parent) {
			this.parent = parent;
			this.parent.children.push(this);
		}

		this.parameters = parameters;
	}


	public run(): void
	{
		if (this.running) {
			return;
		}

		this.running = true;

		this.autoCheck();
	}


	public stop(): void
	{
		if (!this.running) {
			return;
		}

		this.running = false;
	}


	private autoCheck(): void
	{
		if (!this.running) {
			return;
		}

		this.check();

		setTimeout(() => {
			this.autoCheck();
		}, Watcher.INTERVAL);
	}


	public watch(expr: Expression, cb: WatcherCallback): void
	{
		let dependencies = [];

		for (let i = 0; i < expr.dependencies.length; i++) {
			let dependency = Code.interpolateObjectElement(this.parameters, expr.dependencies[i]);

			if (dependency.obj == null) {
				continue;
			}

			let current = dependency.obj[dependency.key];
			let copy = null;

			if (Helpers.isObject(current)) {
				copy = Objects.clone(current);

			} else if (Helpers.isArray(current)) {
				copy = Arrays.clone(current);
			}

			dependencies.push({
				dependency: dependency,
				expr: expr.dependencies[i].code,
				previous: current,
				copy: copy,
			});
		}

		this.listeners.push({
			dependencies: dependencies,
			cb: cb,
		});
	}


	public check(): void
	{
		for (let i = 0; i < this.listeners.length; i++) {
			let listener = this.listeners[i];
			let changed = [];

			for (let j = 0; j < listener.dependencies.length; j++) {
				let notify = false;
				let props = [];
				let dependency = listener.dependencies[j];
				let current = dependency.dependency.obj[dependency.dependency.key];

				if (dependency.previous !== current) {
					notify = true;

				} else if (Helpers.isObject(current)) {
					if (dependency.copy == null) {
						notify = true;
					} else {
						let currentProps = this.compareObjects(current, dependency.copy);

						if (currentProps.length) {
							notify = true;
							props = props.concat(currentProps);
						}
					}

					if (notify) {
						dependency.copy = Objects.clone(current);
					}

				} else if (Helpers.isArray(current)) {
					if (dependency.copy == null) {
						notify = true;
					} else {
						let currentProps = this.compareArrays(current, dependency.copy);

						if (currentProps.length) {
							notify = true;
							props = props.concat(currentProps);
						}
					}

					if (notify) {
						dependency.copy = Arrays.clone(current);
					}
				}

				if (notify) {
					changed.push({
						expr: dependency.expr,
						props: props.length ? props : null,
					});

					dependency.previous = current;
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
