import {CONST} from '../../Facade/Lang';
import {makeDecorator} from '../../Util/Decorators';


export declare interface FilterOptions
{
	name: string,
	injectTemplate?: boolean,
}


@CONST()
export class FilterMetadataDefinition
{


	public name: string;

	public injectTemplate: boolean;


	constructor(options: FilterOptions)
	{
		this.name = options.name;
		this.injectTemplate = typeof options.injectTemplate === 'undefined' ? false : options.injectTemplate;
	}

}


export let Filter = makeDecorator(FilterMetadataDefinition);
