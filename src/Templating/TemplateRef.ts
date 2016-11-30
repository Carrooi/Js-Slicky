import {AbstractTemplate} from './Templates/AbstractTemplate';
import {EmbeddedTemplate} from './Templates/EmbeddedTemplate';
import {ElementRef} from './ElementRef';
import {ParametersList} from '../Interfaces';
import {Scope} from '../Util/Scope';
import {Helpers} from '../Util/Helpers';


export class TemplateRef
{


	public static TEMPLATE_REF_STORAGE = '__slicky_template_ref';


	private template: AbstractTemplate;

	private factory: (parentTemplate: AbstractTemplate, parent: HTMLElement, before?: Node) => void;

	public name: string;
	
	public elementRef: ElementRef;

	public scope: Scope;

	public dynamicScope: Scope;


	constructor(template: AbstractTemplate, elementRef: ElementRef, factory: (parentTemplate: AbstractTemplate, parent: HTMLElement, before?: Node) => void)
	{
		this.template = template;
		this.factory = factory;
		this.elementRef = elementRef;
		this.scope = new Scope;
		this.dynamicScope = new Scope;

		elementRef.nativeElement[TemplateRef.TEMPLATE_REF_STORAGE] = this;
	}


	public static get(el: HTMLElement): TemplateRef
	{
		return el[TemplateRef.TEMPLATE_REF_STORAGE];
	}


	public createEmbeddedTemplate(parameters: ParametersList = {}, before?: Node): EmbeddedTemplate
	{
		if (!before) {
			before = this.elementRef.nativeElement;
		}

		let scope = {};
		let mapping: {[type: string]: string} = {};
		
		this.scope.each((name: string, value: any) => {
			scope[name] = value;
		});

		this.dynamicScope.each((name: string, type: string) => {
			if (typeof parameters[type] === 'undefined') {
				throw new Error('Can not export dynamic parameter "' + name + '" into template. Parameter of type "' + type + '" is missing.');
			}

			scope[name] = parameters[type];
			mapping[type] = name;
			delete parameters[type];
		});

		Helpers.each(parameters, (name: string, value: any) => {
			scope[name] = value;
		});

		let template = new EmbeddedTemplate(this.template.container, this.template, this, scope);
		template.dynamicExportsMapping = mapping;

		this.factory(template, before.parentElement, before);

		return template;
	}

}
