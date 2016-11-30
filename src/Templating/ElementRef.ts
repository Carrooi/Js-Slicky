import {TemplateRef} from './TemplateRef';


export class ElementRef
{


	public static ELEMENT_REF_STORAGE = '__slicky_element_ref';


	public nativeElement: HTMLElement;


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

}
