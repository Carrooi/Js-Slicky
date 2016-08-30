import {IBinding} from './IBinding';


export class AttributeBinding implements IBinding
{


	private el: Element;

	private attr: string;

	private originalAttribute: string;


	constructor(el: Element, attr: string)
	{
		this.el = el;
		this.attr = attr;
		this.originalAttribute = el.getAttribute(attr);
	}


	public attach(): void
	{

	}


	public detach(): void
	{
		this.el.setAttribute(this.attr, this.originalAttribute);
	}


	public onUpdate(value: any): void
	{
		this.updateValue(value);
	}


	private updateValue(value: any): void
	{
		this.el.setAttribute(this.attr, value);
	}

}
