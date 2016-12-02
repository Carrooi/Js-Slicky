import {AbstractExtension} from '../Extensions/AbstractExtension';
import {ProvideOptions, CustomServiceDefinition} from '../DI/Container';
import {ConcreteType} from '../Facade/Lang';
import {Translator} from './Translator';
import {TranslateFilter} from './TranslateFilter';
import {AbstractComponentTemplate} from '../Templating/Templates/AbstractComponentTemplate';
import {ElementRef} from '../Templating/ElementRef';
import {ComponentTranslator} from './ComponentTranslator';


export declare interface ExtensionOptions
{
	locale?: string,
}


export class TranslationsExtension extends AbstractExtension
{


	private translator: Translator;


	constructor(options: ExtensionOptions = {})
	{
		super();

		this.translator = new Translator;

		if (options.locale) {
			this.translator.locale = options.locale;
		}
	}


	public getServices():  Array<ConcreteType|Array<ConcreteType|ProvideOptions>>
	{
		return [
			[
				Translator,
				{
					useFactory: () => this.translator,
				},
			],
		];
	}


	public getFilters(): Array<any>
	{
		return [
			TranslateFilter,
		];
	}


	public doUpdateComponentServices(template: AbstractComponentTemplate, el: ElementRef<HTMLElement>, services: Array<CustomServiceDefinition>): void
	{
		services.push({
			service: ComponentTranslator,
			options: {
				useFactory: () => {
					return new ComponentTranslator(this.translator, template);
				},
			},
		})
	}

}
