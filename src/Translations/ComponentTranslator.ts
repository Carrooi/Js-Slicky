import {Translator, ParamsList} from './Translator';
import {RenderableView} from '../Views/RenderableView';


export class ComponentTranslator
{


	private translator: Translator;

	private view: RenderableView;


	constructor(translator: Translator, view: RenderableView)
	{
		this.translator = translator;
		this.view = view;
	}


	public translate(msg: string, count: number = null, params: ParamsList = {}): string
	{
		return this.translator.translate(this.view, msg, count, params);
	}

}
