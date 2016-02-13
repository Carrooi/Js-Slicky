import {Container} from './DI/Container';
import {Injectable} from './DI/Metadata';
import {Dom} from './Util/Dom';
import {global, ConcreteType} from './Facade/Lang';
import {ComponentMetadataDefinition, InputMetadataDefinition, EventMetadataDefinition, ElementMetadataDefinition} from './Controller/Metadata';
import {Compiler} from './Compiler';
import {Annotations} from './Util/Annotations';
import {Functions} from './Util/Functions';


let Reflect = global.Reflect;


declare interface InputsList
{
	[name: string]: InputMetadataDefinition;
}


declare interface EventsList
{
	[name: string]: EventMetadataDefinition;
}


declare interface ElementsList
{
	[name: string]: ElementMetadataDefinition;
}


declare interface ControllerType
{
	controller: Function;
	metadata: ComponentMetadataDefinition;
	inputs: InputsList;
	events: EventsList;
	elements: ElementsList;
}


declare interface ControllersList
{
	[name: string]: ControllerType;
}


@Injectable()
export class Application
{


	private container: Container;

	private compiler: Compiler;

	private controllers: ControllersList = {};


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

		this.controllers[componentMetadata.getName()] = {
			controller: controller,
			metadata: componentMetadata,
			inputs: inputs,
			events: events,
			elements: elements,
		};
	}


	public hasController(name: string): boolean
	{
		return typeof this.controllers[name] !== 'undefined';
	}


	public createController(name: string): any
	{
		if (!this.hasController(name)) {
			throw new Error('Component ' + name + ' is not registered.');
		}

		return this.container.create(<ConcreteType>this.controllers[name].controller);
	}


	public getControllerMetadata(name: string): ComponentMetadataDefinition
	{
		if (!this.hasController(name)) {
			throw new Error('Component ' + name + ' is not registered.');
		}

		return this.controllers[name].metadata;
	}


	public getControllerInputs(name: string): InputsList
	{
		if (!this.hasController(name)) {
			throw new Error('Component ' + name + ' is not registered.');
		}

		return this.controllers[name].inputs;
	}


	public getControllerEvents(name: string): EventsList
	{
		if (!this.hasController(name)) {
			throw new Error('Component ' + name + ' is not registered.');
		}

		return this.controllers[name].events;
	}


	public getControllerElements(name: string): ElementsList
	{
		if (!this.hasController(name)) {
			throw new Error('Component ' + name + ' is not registered.');
		}

		return this.controllers[name].elements;
	}


	public run(): void
	{
		this.compiler.compile();
	}

}
