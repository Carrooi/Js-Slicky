import {Directive, Input, Required} from '../Entity/Metadata';
import {OnUpdate, OnDestroy} from '../Interfaces';
import {Compiler} from '../Compiler';
import {TemplateRef} from '../Templating/TemplateRef';
import {RenderableView} from '../Views/RenderableView';
import {EmbeddedView} from '../Views/EmbeddedView';
import {ViewFactory} from '../Views/ViewFactory';


@Directive({
	selector: '[\\[s\\:if\\]]',
	compileInner: false,
})
export class IfDirective implements OnUpdate, OnDestroy
{


	private compiler: Compiler;

	private view: RenderableView;

	private viewFactory: ViewFactory;

	private templateRef: TemplateRef;

	private nested: EmbeddedView;


	@Required()
	@Input('s:if')
	public condition: string;


	constructor(compiler: Compiler, view: RenderableView, viewFactory: ViewFactory, templateRef: TemplateRef)
	{
		this.compiler = compiler;
		this.view = view;
		this.viewFactory = viewFactory;
		this.templateRef = templateRef;
	}


	public onDestroy(): void
	{
		if (this.nested) {
			this.view.removeChildView(this.nested);
			this.nested = null;
		}
	}


	public onUpdate(): void
	{
		if (this.condition && !this.nested) {
			this.nested = this.viewFactory.createEmbeddedView(this.view, this.templateRef);
			this.nested.attach();
			this.compiler.compileNodes(this.nested, this.nested.nodes);

		} else if (!this.condition && this.nested) {
			this.view.removeChildView(this.nested);
			this.nested = null;
		}
	}

}
