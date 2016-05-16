import {View} from '../Views/View';
import {ElementRef} from '../Templating/ElementRef';


export abstract class AbstractEntityView
{


	public view: View;

	public el: ElementRef;


	constructor(view: View, el: ElementRef)
	{
		this.view = view;
		this.el = el;
	}


	abstract attach(): void;


	abstract detach(): void;

}
