import {TemplateRef} from '../TemplateRef';
import {AbstractTemplate} from './AbstractTemplate';
import {Container, CustomServiceDefinition} from '../../DI/Container';
import {ParametersList, OnDestroy} from '../../Interfaces';
import {ElementRef} from '../ElementRef';
import {ChangeDetectorRef} from '../../ChangeDetection/ChangeDetectorRef';
import {ExtensionsManager} from '../../Extensions/ExtensionsManager';
import {EventEmitter} from '../../Util/EventEmitter';


export abstract class AbstractComponentTemplate extends AbstractTemplate
{


	public extensions: ExtensionsManager;

	public component: any;

	public elementRef: ElementRef<HTMLElement>;

	public templateRef: TemplateRef;


	constructor(parent: AbstractTemplate, componentType: any, elementRef: ElementRef<HTMLElement>, container: Container, extensions: ExtensionsManager, parameters: ParametersList = {}, templateRef?: TemplateRef, controllerAs?: string, use: Array<CustomServiceDefinition> = [])
	{
		super(container, parameters, parent);

		this.extensions = extensions;
		this.elementRef = elementRef;
		this.templateRef = templateRef;

		use.push({
			service: ElementRef,
			options: {
				useFactory: () => elementRef,
			},
		});

		use.push({
			service: ChangeDetectorRef,
			options: {
				useFactory: () => new ChangeDetectorRef(() => {
					this.changeDetector.check();
				}),
			},
		});

		if (templateRef) {
			use.push({
				service: TemplateRef,
				options: {
					useFactory: () => templateRef,
				},
			});
		}

		this.extensions.doUpdateComponentServices(this, elementRef, use);

		this.component = this.container.create(componentType, use);

		if (controllerAs) {
			this.scope.setParameter(controllerAs, this.component);
		}
	}


	public abstract main(onReady: (rootTemplate: AbstractComponentTemplate, template: AbstractComponentTemplate) => void): void;


	public destroy(): void
	{
		super.destroy();

		if (typeof this.component.__proto__.onDestroy === 'function') {
			(<OnDestroy>this.component).onDestroy();
		}
	}


	public addComponentEventListener(component: any, event: string, call: string|((value: any, component: any) => void)): void
	{
		(<EventEmitter<any>>component[event]).subscribe((value: any) => {
			if (typeof call === 'string') {
				this.eval(<string>call, {
					'$value': value,
					'$this': component,
				});
			} else {
				call(value, component);
			}
		});
	}

}
