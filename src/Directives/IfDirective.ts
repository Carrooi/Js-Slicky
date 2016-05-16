import {Directive, Input, Required} from '../Entity/Metadata';
import {OnUpdate, OnDestroy} from '../Interfaces';
import {Compiler} from '../Compiler';
import {TemplateRef} from '../Templating/TemplateRef';
import {View} from '../Views/View';
import {EmbeddedView} from '../Views/EmbeddedView';


@Directive({
	selector: '[\\[s\\:if\\]]',
	compileInner: false,
})
export class IfDirective implements OnUpdate, OnDestroy
{


	private compiler: Compiler;

	private view: View;

	private templateRef: TemplateRef;

	private nested: EmbeddedView;


	@Required()
	@Input('s:if')
	public condition: string;


	constructor(compiler: Compiler, view: View, templateRef: TemplateRef)
	{
		this.compiler = compiler;
		this.view = view;
		this.templateRef = templateRef;
	}


	public onDestroy(): void
	{
		if (this.nested) {
			this.view.removeEmbeddedView(this.nested);
			this.nested = null;
		}
	}


	public onUpdate(): void
	{
		if (this.condition && !this.nested) {
			this.nested = this.view.createEmbeddedView(this.templateRef);
			this.compiler.compileNodes(this.nested, this.nested.nodes);

		} else if (!this.condition && this.nested) {
			this.view.removeEmbeddedView(this.nested);
			this.nested = null;
		}
	}

}
