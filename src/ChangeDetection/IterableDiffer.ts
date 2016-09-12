import {ChangeDetectionStrategy, ChangeDetectionAction, ExpressionDependencyType} from '../constants';
import {ParametersList, ChangedDependencyProperty, Expression, ExpressionDependency} from '../Interfaces';
import {Helpers} from '../Util/Helpers';
import {Injectable} from '../DI/Metadata';


declare interface TrackByFn
{
	(index: number|string, item: any): number|string,
}


declare interface RecordProperty
{
	key: number|string,
	value: any,
	trackBy: number|string,
}


export class IterableDiffer
{


	private record: any;

	private properties: Array<RecordProperty>;

	private trackBy: TrackByFn;


	constructor(record: any, trackBy?: TrackByFn)
	{
		if (!Helpers.isArray(record) && !Helpers.isObject(record)) {
			throw new Error('IterableDiffer: can only watch arrays or objects, ' + Object.prototype.toString.call(record) + ' given.');
		}

		this.record = record;
		this.trackBy = trackBy ? trackBy : (i: number|string) => i;
		this.storePrevious(this.record);
	}


	public check(): any
	{
		let properties = this.compare();

		if (properties.length) {
			this.storePrevious(this.record);
			return properties;
		}

		return null;
	}


	private compare(): Array<ChangedDependencyProperty>
	{
		let result = [];

		Helpers.each(this.record, (key: number|string, value: any) => {
			let previous = this.getPreviousProperty(key, value);

			if (!previous) {
				result.push({
					property: key,
					action: ChangeDetectionAction.Add,
					newValue: value,
					oldValue: undefined,
				});

			} else if (previous.value !== value) {
				result.push({
					property: key,
					action: ChangeDetectionAction.Update,
					newValue: value,
					oldValue: previous.value,
				});

			} else if (previous.key !== key) {
				result.push({
					property: key,
					action: ChangeDetectionAction.UpdateKey,
					newValue: key,
					oldValue: previous.key,
				});
			}
		});

		for (let i = 0; i < this.properties.length; i++) {
			let property = this.properties[i];
			let current = this.getCurrentProperty(property);

			if (!current) {
				result.push({
					property: property.key,
					action: ChangeDetectionAction.Remove,
					newValue: undefined,
					oldValue: property.value,
				});
			}
		}

		return result;
	}


	private storePrevious(record: any): void
	{
		let properties = [];

		Helpers.each(record, (key: number|string, value: any) => {
			properties.push({
				key: key,
				value: value,
				trackBy: this.trackBy(key, value),
			});
		});

		this.properties = properties;
	}


	private getCurrentProperty(property: RecordProperty): {key: number|string, value: string}
	{
		return Helpers.each(this.record, (rKey: number|string, rValue: any) => {
			if (this.trackBy(rKey, rValue) === property.trackBy) {
				return {
					key: rKey,
					value: rValue,
				};
			}
		});
	}


	private getPreviousProperty(key: string|number, value: any): RecordProperty
	{
		for (let i = 0; i < this.properties.length; i++) {
			let property = this.properties[i];

			if (property.trackBy === this.trackBy(key, value)) {
				return property;
			}
		}

		return null;
	}

}


@Injectable()
export class IterableDifferFactory
{


	public create(record: any, trackBy?: TrackByFn): IterableDiffer
	{
		return new IterableDiffer(record, trackBy);
	}

}
