import {Annotations} from '../Util/Annotations';
import {DirectiveMetadataDefinition, EventMetadataDefinition, InputMetadataDefinition, RequiredMetadataDefinition} from './Metadata';
import {Functions} from '../Util/Functions';
import {global} from '../Facade/Lang';


export declare interface EventsList
{
	[name: string]: EventMetadataDefinition;
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
	inputs: InputsList;
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

					if (propMetadata[propName][i] instanceof EventMetadataDefinition) {
						events[propName] = propMetadata[propName][i];
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
			inputs: inputs,
		};
	}

}
