import {Directive, Input, Required} from '../Entity/Metadata';
import {OnUpdate} from '../Interfaces';
import {ElementRef} from '../Templating/ElementRef';
import {Helpers} from '../Util/Helpers';


@Directive({
	selector: '[\\[s\\:attr\\]]',
})
export class AttrDirective implements OnUpdate
{


	private el: ElementRef;


	@Required()
	@Input('s:attr')
	public attrs: {[name: string]: boolean};


	constructor(el: ElementRef)
	{
		this.el = el;
	}


	public onUpdate(): void
	{
		if (!Helpers.isObject(this.attrs)) {
			throw new Error('AttrDirective: expression must be an object, "' + this.attrs + '" given.');
		}

		let el = <Element>this.el.nativeEl;

		for (let name in this.attrs) {
			if (this.attrs.hasOwnProperty(name)) {
				el[name] = this.attrs[name];
			}
		}
	}

}
