import {TemplateRef} from './TemplateRef';


export class ElementRef
{


	public static ELEMENT_REF_STORAGE = '__slicky_element_ref';


	public nativeElement: HTMLElement;

	private templateRef: TemplateRef;


	constructor(nativeElement: HTMLElement)
	{
		this.nativeElement = nativeElement;
	}


	public static get(el: HTMLElement): ElementRef
	{
		if (typeof el[ElementRef.ELEMENT_REF_STORAGE] === 'undefined') {
			el[ElementRef.ELEMENT_REF_STORAGE] = new ElementRef(el);
		}

		return el[ElementRef.ELEMENT_REF_STORAGE];
	}


	public getTemplateRef(factory?: (elementRef: ElementRef) => TemplateRef): TemplateRef
	{
		if (this.nativeElement.nodeName.toLowerCase() !== 'template') {
			throw new Error('ElementRef: can not create TemplateRef for element "' + this.nativeElement.nodeName.toLowerCase() + '".');
		}

		if (typeof this.templateRef === 'undefined' && factory) {
			this.templateRef = factory(this);
		}

		return this.templateRef;
	}

}
