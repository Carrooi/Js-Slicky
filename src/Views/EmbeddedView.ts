import {RenderableView} from './RenderableView';
import {TemplateRef} from '../Templating/TemplateRef';
import {ElementRef} from '../Templating/ElementRef';
import {RenderableView} from './RenderableView';
import {Dom} from '../Util/Dom';
import {Container} from '../DI/Container';
import {ParametersList} from '../Interfaces';


export class EmbeddedView extends RenderableView
{


	private templateRef: TemplateRef;

	public nodes: Array<Node> = [];

	private attached: boolean = false;


	constructor(container: Container, parent: RenderableView, templateRef: TemplateRef, parameters: ParametersList = {})
	{
		super(container, parent, templateRef.el, parameters);

		this.templateRef = templateRef;
	}


	public attach(before?: Node): void
	{
		if (this.attached) {
			return;
		}

		this.nodes = this.templateRef.insert(before);
		this.attached = true;
	}


	public detach(): void
	{
		super.detach();

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

}
