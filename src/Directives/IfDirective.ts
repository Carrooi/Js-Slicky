import {Directive, Input, Required} from '../Entity/Metadata';
import {OnUpdate, OnDestroy, OnInit} from '../Interfaces';
import {TemplateRef} from '../Templating/TemplateRef';
import {EmbeddedTemplate} from '../Templating/Templates/EmbeddedTemplate';


@Directive({
	selector: '[s:if]',
})
export class IfDirective implements OnInit, OnUpdate, OnDestroy
{


	private templateRef: TemplateRef;

	private nested: EmbeddedTemplate;


	@Required()
	@Input('s:if')
	public condition: string;


	constructor(templateRef: TemplateRef)
	{
		this.templateRef = templateRef;
	}


	public onInit(): void
	{
		this.update();
	}


	public onDestroy(): void
	{
		if (this.nested) {
			this.nested.remove();
			this.nested = null;
		}
	}


	public onUpdate(): void
	{
		this.update();
	}


	private update(): void
	{
		if (this.condition && !this.nested) {
			this.nested = this.templateRef.createEmbeddedTemplate();

		} else if (!this.condition && this.nested) {
			this.nested.remove();
			this.nested = null;
		}
	}

}
