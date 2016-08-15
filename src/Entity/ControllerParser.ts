import {Annotations} from '../Util/Annotations';
import {Functions} from '../Util/Functions';
import {global} from '../Facade/Lang';
import {ComponentMetadataDefinition, HostElementMetadataDefinition} from './Metadata';
import {DirectiveParser, DirectiveDefinition} from './DirectiveParser';


export declare interface ControllerDefinition extends DirectiveDefinition
{
	metadata: ComponentMetadataDefinition;
}


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
		return <ControllerDefinition>DirectiveParser.parse(controller, metadata);
	}

}
