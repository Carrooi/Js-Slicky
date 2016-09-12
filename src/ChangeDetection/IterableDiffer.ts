import {ChangeDetectionStrategy, ChangeDetectionAction, ExpressionDependencyType} from '../constants';
import {ParametersList, ChangedDependencyProperty, Expression, ExpressionDependency} from '../Interfaces';
import {Helpers} from '../Util/Helpers';
import {Injectable} from '../DI/Metadata';


export class IterableDiffer
{


	private record: any;

	private previous: any;


	constructor(record: any)
	{
		if (!Helpers.isArray(record) && !Helpers.isObject(record)) {
			throw new Error('IterableDiffer: can only watch arrays or objects, ' + Object.prototype.toString.call(record) + ' given.');
		}

		this.record = record;
		this.previous = Helpers.clone(this.record);
	}


	public check(): any
	{
		let props = this.compare(this.record, this.previous);

		if (props.length) {
			this.previous = Helpers.clone(this.record);
			return props;
		}

		return null;
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

}


@Injectable()
export class IterableDifferFactory
{


	public create(record: any): IterableDiffer
	{
		return new IterableDiffer(record);
	}

}
