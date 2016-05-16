import {View} from '../Views/View';


declare interface AttributeProperty
{
	name: string;
	expression: string;
	property: boolean;
	event: boolean;
	bound: boolean;
}


export class ElementRef
{


	public static NODE_PROPERTY_STORAGE_NAME = '__slicky_node_ref__';


	private marker: Comment;

	public nativeEl: Node;

	public view: View;

	public attributes: Array<AttributeProperty> = null;


	constructor(nativeEl: Node)
	{
		this.nativeEl = nativeEl;
	}


	public static getByNode(node: Node): ElementRef
	{
		return ElementRef.exists(node) ?
			node[ElementRef.NODE_PROPERTY_STORAGE_NAME] :
			node[ElementRef.NODE_PROPERTY_STORAGE_NAME] = new ElementRef(node)
		;
	}


	public static exists(node: Node): boolean
	{
		return typeof node[ElementRef.NODE_PROPERTY_STORAGE_NAME] !== 'undefined';
	}


	public isType(nodeType: number): boolean
	{
		return this.nativeEl.nodeType === nodeType;
	}


	public isElement(elementType: string|Array<string>): boolean
	{
		let names: Array<string> = typeof elementType === 'string' ? [elementType] : elementType;
		let name = this.nativeEl.nodeName.toUpperCase();

		for (let i = 0; i < names.length; i++) {
			if (names[i].toUpperCase() === name) {
				return true;
			}
		}

		return false;
	}


	public remove(): void
	{
		if (this.nativeEl.parentElement) {
			this.nativeEl.parentElement.removeChild(this.nativeEl);
		}
	}


	public createMarker(): Comment
	{
		if (this.marker) {
			return this.marker;
		}

		let el = this.nativeEl;
		let marker = document.createComment(' -slicky--data- ');

		el.parentNode.insertBefore(marker, el);

		return this.marker = marker;
	}


	public moveToMemory(): void
	{
		if (this.nativeEl.parentElement) {
			this.createMarker();
			this.nativeEl.parentElement.removeChild(this.nativeEl);
		}
	}


	public moveToDOM(): void
	{
		if (!this.nativeEl.parentElement && this.marker) {
			this.marker.parentElement.insertBefore(this.nativeEl, this.marker.nextSibling);
		}
	}


	public getAttributes(): Array<AttributeProperty>
	{
		if (this.attributes === null) {
			let attributes = [];

			for (let i = 0; i < this.nativeEl.attributes.length; i++) {
				let attr = this.nativeEl.attributes[i];

				let name = attr.name;

				let property = false;
				let event = false;

				if (name.match(/^\[.+?\]$/)) {
					name = name.substring(1, name.length - 1);
					property = true;
				}

				if (name.match(/^\(.+?\)$/)) {
					name = name.substring(1, name.length - 1);
					event = true;
				}

				attributes.push({
					name: name,
					expression: attr.value,
					property: property,
					event: event,
					bound: false,
				});
			}

			this.attributes = attributes;
		}

		return this.attributes;
	}


	public getAttribute(name: string): AttributeProperty
	{
		let attributes = this.getAttributes();

		for (let i = 0; i < attributes.length; i++) {
			if (attributes[i].name === name) {
				return attributes[i];
			}
		}

		return null;
	}

}
