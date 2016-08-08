import {AbstractView} from './AbstractView';
import {TemplateRef} from '../Templating/TemplateRef';
import {ElementRef} from '../Templating/ElementRef';
import {ComponentView} from './ComponentView';
import {Dom} from '../Util/Dom';
import {ParametersList} from '../Interfaces';


export class EmbeddedView extends AbstractView
{


	private templateRef: TemplateRef;

	public nodes: Array<Node> = [];
	
	public parameters: ParametersList = {};

	private attached: boolean = false;


	constructor(view: ComponentView, templateRef: TemplateRef)
	{
		super(view);

		this.templateRef = templateRef;
	}


	public addParameter(name: string, value: any): void
	{
		if (typeof this.parameters[name] !== 'undefined') {
			throw new Error('Can not import variable ' + name + ' since its already in use.');
		}

		this.parameters[name] = value;
	}


	public attach(marker: Comment): void
	{
		if (this.attached) {
			return;
		}

		let el = this.templateRef.el.nativeEl;
		if (this.templateRef.el.isElement('TEMPLATE') && el['content']) {
			el = document.importNode(el, true)['content'];
		}

		let childNodes = el.childNodes;

		for (let i = 0; i < childNodes.length; i++) {
			let clone = childNodes[i].cloneNode(true);

			Dom.insertBefore(clone, marker);

			this.nodes.push(clone);
		}

		this.attached = true;
	}


	public detach(): void
	{
		if (!this.attached) {
			return;
		}

		for (let i = 0; i < this.nodes.length; i++) {
			let node = this.nodes[i];

			if (ElementRef.exists(node)) {
				let elementRef = ElementRef.getByNode(node);

				if (elementRef.view) {
					elementRef.view.detach();
				}

				elementRef.remove();
			} else if (node.parentElement) {
				node.parentElement.removeChild(node);
			}
		}

		this.nodes = [];
	}


	public getView(): ComponentView
	{
		if (!(this.parent instanceof ComponentView)) {
			throw new Error('Unexpected error in EmbeddedView.');
		}

		return <ComponentView>this.parent;
	}

}
