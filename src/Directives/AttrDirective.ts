import {Directive, Input, Required} from '../Entity/Metadata';
import {OnUpdate, OnInit} from '../Interfaces';
import {ElementRef} from '../Templating/ElementRef';
import {Helpers} from '../Util/Helpers';


@Directive({
	selector: '[s:attr]',
})
export class AttrDirective implements OnInit, OnUpdate
{


	private el: ElementRef<HTMLElement>;


	@Required()
	@Input('s:attr')
	public attrs: {[name: string]: boolean};


	constructor(el: ElementRef<HTMLElement>)
	{
		this.el = el;
	}


	public onInit(): void
	{
		this.update();
	}


	public onUpdate(): void
	{
		this.update();
	}


	private update(): void
	{
		if (!Helpers.isObject(this.attrs)) {
			throw new Error('AttrDirective: expression must be an object, "' + this.attrs + '" given.');
		}

		let el = <Element>this.el.nativeElement;

		for (let name in this.attrs) {
			if (this.attrs.hasOwnProperty(name)) {
				el[name] = this.attrs[name];
			}
		}
	}

}
