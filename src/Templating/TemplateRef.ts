import {ElementRef} from './ElementRef';
import {Dom} from '../Util/Dom';


export class TemplateRef
{


	public el: ElementRef;

	private marker: Comment;


	constructor(el: ElementRef)
	{
		this.el = el;
	}


	public getId(): string
	{
		if (!Dom.propertyExists(this.el.nativeEl, 'id')) {
			return null;
		}

		return this.el.nativeEl.attributes.getNamedItem('id').value;
	}


	public createMarker(): Comment
	{
		if (this.marker) {
			return this.marker;
		}

		let el = this.el.nativeEl;
		let marker = document.createComment(' -slicky--data- ');

		el.parentNode.insertBefore(marker, el);

		return this.marker = marker;
	}


	public storeElement(): void
	{
		this.createMarker();
		this.el.remove();
	}



	public getNodes(): NodeList
	{
		let el = this.el.nativeEl;
		if (el['content']) {
			el = document.importNode(el, true)['content'];
		}

		return el.childNodes;
	}


	public insert(before?: Node): Array<Node>
	{
		if (!before) {
			before = this.createMarker();
		}

		let childNodes = this.getNodes();
		let inserted = [];

		for (let i = 0; i < childNodes.length; i++) {
			let clone = childNodes[i].cloneNode(true);
			Dom.insertBefore(clone, before);
			inserted.push(clone);
		}

		return inserted;
	}

}
