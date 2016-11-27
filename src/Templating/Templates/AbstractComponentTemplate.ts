import {TemplateRef} from '../TemplateRef';
import {AbstractTemplate} from './AbstractTemplate';
import {Container} from '../../DI/Container';
import {ParametersList, OnDestroy} from '../../Interfaces';
import {ElementRef} from '../ElementRef';
import {ChangeDetectorRef} from '../../ChangeDetection/ChangeDetectorRef';


export abstract class AbstractComponentTemplate extends AbstractTemplate
{


	private templates: {[name: string]: TemplateRef} = {};

	public component: any;

	public elementRef: ElementRef;

	public templateRef: TemplateRef;


	constructor(parent: AbstractTemplate, componentType: any, elementRef: ElementRef, container: Container, parameters: ParametersList = {}, templateRef?: TemplateRef, controllerAs?: string)
	{
		super(container, parameters, parent);

		this.elementRef = elementRef;
		this.templateRef = templateRef;

		let use = [
			{
				service: ElementRef,
				options: {
					useFactory: () => elementRef,
				},
			},
			{
				service: ChangeDetectorRef,
				options: {
					useFactory: () => new ChangeDetectorRef(() => {
						this.changeDetector.check();
					}),
				},
			},
		];

		if (templateRef) {
			use.push(<any>{
				service: TemplateRef,
				options: {
					useFactory: () => templateRef,
				},
			});
		}

		this.component = this.container.create(componentType, use);

		if (controllerAs) {
			this.scope.setParameter(controllerAs, this.component);
		}
	}


	public abstract main(onReady: (rootTemplate: AbstractComponentTemplate, template: AbstractComponentTemplate) => void): void;


	public destroy(): void
	{
		super.destroy();

		if (typeof this.component.prototype.onDestroy === 'function') {
			(<OnDestroy>this.component.prototype).onDestroy();
		}
	}


	protected registerTemplate(templateRef: TemplateRef, name: string): void
	{
		this.templates[name] = templateRef;
	}


	protected getTemplate(name: string): TemplateRef
	{
		if (typeof this.templates[name] === 'undefined') {
			throw new Error('Template "' + name + '" does not exists.');
		}

		return this.templates[name];
	}

}
