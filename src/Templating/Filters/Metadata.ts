import {CONST} from '../../Facade/Lang';
import {makeDecorator} from '../../Util/Decorators';


declare interface FilterOptions
{
	name: string,
}


@CONST()
export class FilterMetadataDefinition
{


	public name: string;


	constructor(options: FilterOptions)
	{
		this.name = options.name;
	}

}


export var Filter = makeDecorator(FilterMetadataDefinition);
