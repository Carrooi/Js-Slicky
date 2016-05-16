import {IBinding} from './IBinding';
import {Dom} from '../../Util/Dom';


export class PropertyBinding implements IBinding
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
		let path = this.attr.split('.');

		if (path.length === 1) {
			this.el[this.attr] = value;

		} else if (path[0] === 'style') {
			(<HTMLElement>this.el).style[path[1]] = !value ?
				null :
				value
			;

		} else if (path[0] === 'class') {
			let className = path[1];

			if (value) {
				Dom.addCssClass(this.el, className);
			} else {
				Dom.removeCssClass(this.el, className);
			}

		} else {
			throw new Error('Can not bind to ' + this.attr + ' property on element.');
		}
	}

}
