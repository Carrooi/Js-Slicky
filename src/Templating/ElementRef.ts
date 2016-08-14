import {RenderableView} from '../Views/RenderableView';
import {Dom} from '../Util/Dom';
import {AttributesList} from '../Interfaces';


export class ElementRef
{


	public static NODE_PROPERTY_STORAGE_NAME = '__slicky_node_ref__';


	public nativeEl: Node;

	public view: RenderableView;


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
		Dom.remove(this.nativeEl);
	}


	public static getAttributes(el: Node): AttributesList
	{
		let attributes: AttributesList = {};

		for (let i = 0; i < el.attributes.length; i++) {
			let attr = el.attributes[i];

			let name = attr.name.toLowerCase();

			let directiveExport = false;
			let property = false;
			let event = false;

			if (name.match(/^#/)) {
				name = name.substring(1);
				directiveExport = true;
			}

			if (name.match(/^\[.+?\]$/)) {
				name = name.substring(1, name.length - 1);
				property = true;
			}

			if (name.match(/^\(.+?\)$/)) {
				name = name.substring(1, name.length - 1);
				event = true;
			}

			attributes[name] = {
				name: name,
				expression: attr.value,
				directiveExport: directiveExport,
				property: property,
				event: event,
				bound: false,
			};
		}

		return attributes;
	}

}
