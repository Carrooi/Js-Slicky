import {AbstractView, ParametersList} from './AbstractView';
import {ComponentView} from './ComponentView';
import {ElementRef} from '../Templating/ElementRef';
import {Helpers} from '../Util/Helpers';


export class ApplicationView extends AbstractView
{


	public el: Element;

	public controller: any;


	constructor(el: Element, controller: any, parameters: ParametersList = {})
	{
		super(null, parameters);

		this.el = el;
		this.controller = controller;
	}


	public createApplicationComponentView(el: Element): ComponentView
	{
		let parameters = Helpers.clone(this.parameters);
		let view = new ComponentView(this, ElementRef.getByNode(el), parameters);

		view.directives = [this.controller];

		return view;
	}

}
