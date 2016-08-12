import {Filter} from '../Templating/Filters/Metadata';
import {ViewAware} from '../Templating/Filters/ViewAware';
import {Translator, ParamsList} from './Translator';
import {RenderableView} from '../Views/RenderableView';


@Filter({
	name: 'translate',
})
export class TranslateFilter implements ViewAware
{


	private translator: Translator;

	private view: RenderableView;


	constructor(translator: Translator)
	{
		this.translator = translator;
	}


	public onView(view: RenderableView): void
	{
		this.view = view;
	}


	public transform(msg: string, countOrParams: number|ParamsList = null, params: ParamsList = null): string
	{
		if (!this.view) {
			throw new Error('Translate filter must be called from template.');
		}

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

		return this.translator.translate(this.view, msg, count, parameters);
	}

}
