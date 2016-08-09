import {IBinding} from './IBinding';


export class AttributeBinding implements IBinding
{


	private el: Element;

	private attr: string;


	constructor(el: Element, attr: string)
	{
		this.el = el;
		this.attr = attr;
	}


	public attach(): void
	{

	}


	public detach(): void
	{

	}


	public onUpdate(value: any): void
	{
		this.updateValue(value);
	}


	private updateValue(value: any): void
	{
		let name = this.attr === 'class' ? 'className' : this.attr;

		this.el[name] = value;
	}

}
