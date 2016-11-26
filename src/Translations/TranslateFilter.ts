import {Filter} from '../Templating/Filters/Metadata';
import {Translator, ParamsList} from './Translator';
import {AbstractTemplate} from '../Templating/Templates/AbstractTemplate';


@Filter({
	name: 'translate',
	injectTemplate: true,
})
export class TranslateFilter
{


	private translator: Translator;


	constructor(translator: Translator)
	{
		this.translator = translator;
	}


	public transform(template: AbstractTemplate, msg: string, countOrParams: number|ParamsList = null, params: ParamsList = null): string
	{
		let count = null;
		let parameters = {};

		if (typeof countOrParams === 'number') {
			count = countOrParams;
		} else if (countOrParams !== null) {
			parameters = countOrParams;
		}

		if (params !== null) {
			parameters = params;
		}

		return this.translator.translate(template, msg, count, parameters);
	}

}
