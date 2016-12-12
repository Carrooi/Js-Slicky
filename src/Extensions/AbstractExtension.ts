import {CustomServiceDefinition, ProvideOptions} from '../DI/Container';
import {AbstractComponentTemplate} from '../Templating/Templates/AbstractComponentTemplate';
import {ElementRef} from '../Templating/ElementRef';
import {ConcreteType} from '../Facade/Lang';
import {ParametersList} from '../Interfaces';


export abstract class AbstractExtension
{


	public getServices(): Array<ConcreteType|Array<ConcreteType|ProvideOptions>>
	{
		return [];
	}


	public getParameters(): ParametersList
	{
		return {};
	}


	public getFilters(): Array<any>
	{
		return [];
	}


	public getDirectives(): Array<any>
	{
		return [];
	}


	public doUpdateComponentServices(template: AbstractComponentTemplate, el: ElementRef<HTMLElement>, services: Array<CustomServiceDefinition>): void
	{
	}

}
