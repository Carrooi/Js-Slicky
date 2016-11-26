import {Directive, Input, Required} from '../Entity/Metadata';
import {OnUpdate, OnInit} from '../Interfaces';
import {ElementRef} from '../Templating/ElementRef';
import {Helpers} from '../Util/Helpers';
import {Dom} from '../Util/Dom';


@Directive({
	selector: '[s:class]',
})
export class ClassDirective implements OnInit, OnUpdate
{


	private el: ElementRef;


	@Required()
	@Input('s:class')
	public classes: {[name: string]: boolean};


	constructor(el: ElementRef)
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
		if (!Helpers.isObject(this.classes)) {
			throw new Error('ClassDirective: expression must be an object, "' + this.classes + '" given.');
		}

		let el = <Element>this.el.nativeElement;

		for (let name in this.classes) {
			if (this.classes.hasOwnProperty(name)) {
				let exists = Dom.hasCssClass(el, name);

				if (exists && !this.classes[name]) {
					Dom.removeCssClass(el, name);
				} else if (!exists && this.classes[name]) {
					Dom.addCssClass(el, name);
				}
			}
		}
	}

}
