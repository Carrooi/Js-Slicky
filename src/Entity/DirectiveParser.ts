import {Annotations} from '../Util/Annotations';
import {Functions} from '../Util/Functions';
import {Errors} from '../Errors';
import {global} from '../Facade/Lang';
import {ChangeDetectionStrategy} from '../constants';
import {
	DirectiveMetadataDefinition, HostEventMetadataDefinition, HostElementMetadataDefinition, InputMetadataDefinition,
	RequiredMetadataDefinition, ComponentMetadataDefinition, OutputMetadataDefinition,
	ParentComponentDefinition, ChildDirectiveDefinition
} from './Metadata';


export enum DirectiveType
{
	Directive,
	Component,
}


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


export declare interface OutputList
{
	[name: string]: OutputMetadataDefinition;
}


export declare interface ChildDirectivesList
{
	[name: string]: ChildDirectiveDefinition;
}


export declare interface DirectiveDefinitionMetadata
{
	selector: string,
	controllerAs?: string,
	exportAs?: string,
	changeDetection?: ChangeDetectionStrategy,
	template?: string,
	directives?: Array<any>,
	filters?: Array<any>,
	translations?: {[locale: string]: any},
}


export declare interface DirectiveDefinition
{
	name: string,
	type: DirectiveType,
	metadata: DirectiveDefinitionMetadata,
	events: EventsList,
	elements: ElementsList,
	inputs: InputsList,
	outputs: OutputList,
	parentComponent?: {
		property: string,
		definition: ParentComponentDefinition,
	},
	childDirectives: ChildDirectivesList,
}


let Reflect = global.Reflect;


export class DirectiveParser
{


	public static parse(directiveType: Function): DirectiveDefinition
	{
		let metadata = DirectiveParser.getMetadata(directiveType);
		let propMetadata = Reflect.getMetadata('propMetadata', directiveType);

		let inputs: InputsList = {};
		let outputs: OutputList = {};
		let events: EventsList = {};
		let elements: ElementsList = {};
		let parentComponent: {properties: Array<string>, definition: ParentComponentDefinition} = {properties: [], definition: null};
		let childDirectives: ChildDirectivesList = {};

		for (let propName in propMetadata) {
			if (propMetadata.hasOwnProperty(propName)) {
				let inputMetadata: InputMetadataDefinition = null;
				let childMetadata: ChildDirectiveDefinition = null;
				let requiredMetadata: RequiredMetadataDefinition = null;

				for (let i = 0; i < propMetadata[propName].length; i++) {
					if (propMetadata[propName][i] instanceof InputMetadataDefinition) {
						inputMetadata = propMetadata[propName][i];
					}

					if (propMetadata[propName][i] instanceof ChildDirectiveDefinition && metadata.type === DirectiveType.Component) {
						childMetadata = propMetadata[propName][i];
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

					if (propMetadata[propName][i] instanceof OutputMetadataDefinition) {
						outputs[propName] = propMetadata[propName][i];
					}

					if (propMetadata[propName][i] instanceof ParentComponentDefinition) {
						parentComponent.properties.push(propName);
						parentComponent.definition = propMetadata[propName][i];
					}
				}

				if (inputMetadata !== null) {
					if (requiredMetadata !== null) {
						inputMetadata.required = true;
					}

					inputs[propName] = inputMetadata;
				}

				if (childMetadata !== null) {
					if (requiredMetadata !== null) {
						childMetadata.required = true;
					}

					childDirectives[propName] = childMetadata;
				}
			}
		}

		let directive: DirectiveDefinition = {
			name: Functions.getName(directiveType),
			type: metadata.type,
			metadata: metadata.metadata,
			events: events,
			elements: elements,
			inputs: inputs,
			outputs: outputs,
			childDirectives: childDirectives,
		};

		if (parentComponent.definition) {
			if (parentComponent.properties.length > 1) {
				throw Errors.tooManyParentComponentsRequests(directive.name, parentComponent.properties);
			}

			directive.parentComponent = {
				property: parentComponent.properties[0],
				definition: parentComponent.definition,
			};
		}

		return directive;
	}


	private static getMetadata(directiveType: any): {type: DirectiveType, metadata: DirectiveDefinitionMetadata}
	{
		let type = DirectiveType.Directive;
		let metadata;
		let data: DirectiveDefinitionMetadata = {
			selector: '',
		};

		if (!(metadata = Annotations.getAnnotation(directiveType, ComponentMetadataDefinition))) {
			if (!(metadata = Annotations.getAnnotation(directiveType, DirectiveMetadataDefinition))) {
				throw new Error('Directive ' + Functions.getName(directiveType) + ' is not valid directive, please add @Directive() or @Component() annotation.');
			}
		} else {
			type = DirectiveType.Component;

			data.controllerAs = metadata.controllerAs;
			data.changeDetection = metadata.changeDetection;
			data.template = metadata.template;
			data.directives = metadata.directives;
			data.filters = metadata.filters;
			data.translations = metadata.translations;
		}

		data.selector = metadata.selector;
		data.exportAs = metadata.exportAs;

		return {
			type: type,
			metadata: data,
		};
	}

}
