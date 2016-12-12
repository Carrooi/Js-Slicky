import {ParametersList} from '../Interfaces';
import {Helpers} from './Helpers';


export class Scope
{


	private parameters: ParametersList;

	private parent: Scope;


	constructor(defaults: ParametersList = {}, parent?: Scope)
	{
		this.parameters = defaults;
		this.parent = parent;
	}


	public getParameters(): ParametersList
	{
		return this.parameters;
	}


	public each(fn: (name: string, value: any) => void): void
	{
		Helpers.each(this.parameters, fn);
	}


	public hasParameter(name: string): boolean
	{
		return typeof this.parameters[name] !== 'undefined';
	}


	public addParameter(name: string, value: any): void
	{
		if (this.hasParameter(name)) {
			throw new Error('Can not add variable ' + name + ' since its already in use.');
		}

		this.setParameter(name, value);
	}


	public addParameters(parameters: ParametersList): void
	{
		for (let name in parameters) {
			if (parameters.hasOwnProperty(name)) {
				this.addParameter(name, parameters[name]);
			}
		}
	}


	public setParameter(name: string, value: any): void
	{
		this.parameters[name] = value;
	}


	public setParameters(parameters: ParametersList): void
	{
		for (let name in parameters) {
			if (parameters.hasOwnProperty(name)) {
				this.setParameter(name, parameters[name]);
			}
		}
	}


	public findParameter(name: string): any
	{
		let scope: Scope = this;

		while (scope) {
			if (typeof scope.parameters[name] !== 'undefined') {
				return scope.parameters[name];
			}

			scope = scope.parent;
		}

		return undefined;
	}

}
