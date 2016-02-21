import {Container} from './DI/Container';
import {Injectable} from './DI/Metadata';
import {Dom} from './Util/Dom';
import {global, ConcreteType} from './Facade/Lang';
import {ComponentMetadataDefinition, InputMetadataDefinition, EventMetadataDefinition, ElementMetadataDefinition} from './Controller/Metadata';
import {Compiler} from './Compiler';
import {Annotations} from './Util/Annotations';
import {Functions} from './Util/Functions';


let Reflect = global.Reflect;


export declare interface InputsList
{
	[name: string]: InputMetadataDefinition;
}


export declare interface EventsList
{
	[name: string]: EventMetadataDefinition;
}


export declare interface ElementsList
{
	[name: string]: ElementMetadataDefinition;
}


export declare interface ControllerDefinition
{
	controller: Function;
	metadata: ComponentMetadataDefinition;
	inputs: InputsList;
	events: EventsList;
	elements: ElementsList;
}


@Injectable()
export class Application
{


	private container: Container;

	private compiler: Compiler;

	private controllers: Array<ControllerDefinition> = [];


	constructor(container: Container)
	{
		this.container = container;
		this.compiler = new Compiler(this);

		this.container.provide(Compiler, {
			useFactory: () => {
				return this.compiler;
			}
		});

		this.container.provide(Application, {
			useFactory: () => {
				return this;
			}
		});
	}


	public registerController(controller: Function): void
	{
		let componentMetadata = Annotations.getAnnotation(controller, ComponentMetadataDefinition);
		if (!componentMetadata) {
			throw new Error('Controller ' + Functions.getName(controller) + ' is not valid component, please add @Component annotation.');
		}

		let propMetadata = Reflect.getMetadata('propMetadata', controller);

		let inputs: InputsList = {};
		let events: EventsList = {};
		let elements: ElementsList = {};

		for (let propName in propMetadata) {
			if (propMetadata.hasOwnProperty(propName)) {
				for (let i = 0; i < propMetadata[propName].length; i++) {
					if (propMetadata[propName][i] instanceof InputMetadataDefinition) {
						inputs[propName] = propMetadata[propName][i];
						break;
					}

					if (propMetadata[propName][i] instanceof EventMetadataDefinition) {
						events[propName] = propMetadata[propName][i];
						break;
					}

					if (propMetadata[propName][i] instanceof ElementMetadataDefinition) {
						elements[propName] = propMetadata[propName][i];
						break;
					}
				}
			}
		}

		this.controllers.push({
			controller: controller,
			metadata: componentMetadata,
			inputs: inputs,
			events: events,
			elements: elements,
		});
	}


	public registerControllers(controllers: Array<Function>): void
	{
		for (let i = 0; i < controllers.length; i++) {
			this.registerController(controllers[i]);
		}
	}


	public getControllers(): Array<ControllerDefinition>
	{
		return this.controllers;
	}


	public createController(controller: any): any
	{
		return this.container.create(controller);
	}


	public run(): void
	{
		this.compiler.compile();
	}

}
