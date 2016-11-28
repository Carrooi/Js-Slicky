import {Translator, ParamsList} from './Translator';
import {AbstractTemplate} from '../Templating/Templates/AbstractTemplate';


export class ComponentTranslator
{


	private translator: Translator;

	private template: AbstractTemplate;


	constructor(translator: Translator, template: AbstractTemplate)
	{
		this.translator = translator;
		this.template = template;
	}


	public translate(msg: string, count: number = null, params: ParamsList = {}): string
	{
		return this.translator.translate(this.template, msg, count, params);
	}

}
