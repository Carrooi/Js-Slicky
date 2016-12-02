export class ElementRef<T extends HTMLElement>
{


	public static ELEMENT_REF_STORAGE = '__slicky_element_ref';


	public nativeElement: T;


	constructor(nativeElement: T)
	{
		this.nativeElement = nativeElement;
	}


	public static get<T extends HTMLElement>(el: HTMLElement): ElementRef<T>
	{
		if (typeof el[ElementRef.ELEMENT_REF_STORAGE] === 'undefined') {
			el[ElementRef.ELEMENT_REF_STORAGE] = new ElementRef(el);
		}

		return el[ElementRef.ELEMENT_REF_STORAGE];
	}

}
