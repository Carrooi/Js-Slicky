import {Annotations} from '../Util/Annotations';
import {Functions} from '../Util/Functions';
import {global} from '../Facade/Lang';
import {ComponentMetadataDefinition, HostElementMetadataDefinition} from './Metadata';
import {DirectiveParser, DirectiveDefinition} from './DirectiveParser';


export declare interface ElementsList
{
	[name: string]: HostElementMetadataDefinition;
}


export declare interface ControllerDefinition extends DirectiveDefinition
{
	metadata: ComponentMetadataDefinition;
	elements: ElementsList;
}


let Reflect = global.Reflect;


export class ControllerParser extends DirectiveParser
{


	public static getControllerMetadata(controller: Function): ComponentMetadataDefinition
	{
		let metadata: ComponentMetadataDefinition = Annotations.getAnnotation(controller, ComponentMetadataDefinition);
		if (!metadata) {
			throw new Error('Controller ' + Functions.getName(controller) + ' is not valid component, please add @Component annotation.');
		}

		return metadata;
	}


	public static parse(controller: Function, metadata: ComponentMetadataDefinition): ControllerDefinition
	{
		let result = DirectiveParser.parse(controller, metadata);

		let propMetadata = Reflect.getMetadata('propMetadata', controller);

		let elements: ElementsList = {};

		for (let propName in propMetadata) {
			if (propMetadata.hasOwnProperty(propName)) {
				for (let i = 0; i < propMetadata[propName].length; i++) {
					if (propMetadata[propName][i] instanceof HostElementMetadataDefinition) {
						elements[propName] = propMetadata[propName][i];
						break;
					}
				}
			}
		}

		result['elements'] = elements;

		return <ControllerDefinition> result;
	}

}
