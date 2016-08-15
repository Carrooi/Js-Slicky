import {Annotations} from '../Util/Annotations';
import {DirectiveMetadataDefinition, HostEventMetadataDefinition, HostElementMetadataDefinition, InputMetadataDefinition, RequiredMetadataDefinition} from './Metadata';
import {Functions} from '../Util/Functions';
import {global} from '../Facade/Lang';


export declare interface EventsList
{
	[name: string]: HostEventMetadataDefinition;
}


export declare interface ElementsList
{
	[name: string]: HostElementMetadataDefinition;
}


export declare interface InputsList
{
	[name: string]: InputMetadataDefinition;
}


export declare interface DirectiveDefinition
{
	directive: Function,
	metadata: DirectiveMetadataDefinition,
	events: EventsList,
	elements: ElementsList;
	inputs: InputsList,
	name: string,
}


let Reflect = global.Reflect;


export class DirectiveParser
{


	public static getDirectiveMetadata(directive: Function): DirectiveMetadataDefinition
	{
		let metadata: DirectiveMetadataDefinition = Annotations.getAnnotation(directive, DirectiveMetadataDefinition);
		if (!metadata) {
			throw new Error('Directive ' + Functions.getName(directive) + ' is not valid directive, please add @Directive annotation.');
		}

		return metadata;
	}


	public static parse(directive: Function, metadata: DirectiveMetadataDefinition): DirectiveDefinition
	{
		let propMetadata = Reflect.getMetadata('propMetadata', directive);

		let inputs: InputsList = {};
		let events: EventsList = {};
		let elements: ElementsList = {};

		for (let propName in propMetadata) {
			if (propMetadata.hasOwnProperty(propName)) {
				let inputMetadata: InputMetadataDefinition = null;
				let requiredMetadata: RequiredMetadataDefinition = null;

				for (let i = 0; i < propMetadata[propName].length; i++) {
					if (propMetadata[propName][i] instanceof InputMetadataDefinition) {
						inputMetadata = propMetadata[propName][i];
					}

					if (propMetadata[propName][i] instanceof RequiredMetadataDefinition) {
						requiredMetadata = propMetadata[propName][i];
					}

					if (propMetadata[propName][i] instanceof HostEventMetadataDefinition) {
						events[propName] = propMetadata[propName][i];
						break;
					}

					if (propMetadata[propName][i] instanceof HostElementMetadataDefinition) {
						elements[propName] = propMetadata[propName][i];
						break;
					}
				}

				if (inputMetadata !== null) {
					if (requiredMetadata !== null) {
						inputMetadata.required = true;
					}

					inputs[propName] = inputMetadata;
				}
			}
		}

		return {
			directive: directive,
			metadata: metadata,
			events: events,
			elements: elements,
			inputs: inputs,
			name: Functions.getName(directive),
		};
	}

}
