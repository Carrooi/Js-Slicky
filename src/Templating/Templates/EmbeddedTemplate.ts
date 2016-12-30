import {TemplateRef} from '../TemplateRef';
import {AbstractTemplate} from './AbstractTemplate';
import {ParametersList} from '../../Interfaces';
import {Container} from '../../DI/Container';
import {Dom} from '../../Util/Dom';
import {Helpers} from '../../Util/Helpers';


export class EmbeddedTemplate extends AbstractTemplate
{


	private templateRef: TemplateRef;

	public dynamicExportsMapping: {[type: string]: string} = {};

	public nodes: Array<Node> = [];


	constructor(container: Container, parent: AbstractTemplate, templateRef: TemplateRef, parameters: ParametersList = {})
	{
		super(container, parameters, parent, parent.scope);

		this.templateRef = templateRef;
		this.realm = parent.realm;
	}


	protected appendChild(parent: HTMLElement, node: Node, before?: Node, definition?: (node: Node) => void): Node
	{
		this.nodes.push(node);
		return super.appendChild(parent, node, before, definition);
	}


	public updateExports(parameters: ParametersList = {}): void
	{
		Helpers.each(parameters, (name: string, value: any) => {
			if (typeof this.dynamicExportsMapping[name] === 'undefined') {
				return;
			}

			this.scope.setParameter(this.dynamicExportsMapping[name], value);
		});
	}


	public remove(): void
	{
		this.destroy();

		for (let i = 0; i < this.nodes.length; i++) {
			Dom.remove(this.nodes[i]);
		}
	}

}
