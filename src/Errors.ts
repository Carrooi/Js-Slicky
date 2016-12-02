export class Errors
{


	public static suitableInputNotFound(directiveName: string, inputName: string, elementName: string): Error
	{
		return new Error(directiveName + '.' + inputName + ': could not find any suitable input in "' + elementName + '" element.');
	}


	public static invalidFilter(filterName: string): Error
	{
		return new Error('Filter ' + filterName + ' is not valid filter, please add @Filter annotation.');
	}


	public static ambitiousExportingDirectives(elementName: string, exportName: string): Error
	{
		return new Error('Please, specify exporting type for "' + exportName + '". Element "' + elementName + '" has more than one attached directives.');
	}


	public static unknownExportingDirective(elementName: string, directiveName: string, exportName: string): Error
	{
		return new Error('Can not export directive "' + directiveName + '" into "' + exportName + '" on element "' + elementName + '". Such directive does not exists there.');
	}


	public static invalidEventListenerType(directiveName: string, property: string): Error
	{
		return new Error(directiveName + '.' + property + ': only string event listeners are supported.');
	}


	public static templateNotFound(selector: string): Error
	{
		return new Error('Can not include template by selector "' + selector + '". Template element does not exists.');
	}


	public static hostElementForHostEventNotFound(definitionName: string, property: string, event: string, hostElement: string): Error
	{
		return new Error(definitionName + '.' + property + ': could not bind "' + event + '" event to host element "' + hostElement + '". Host element does not exists.');
	}


	public static hostEventElementNotFound(definitionName: string, property: string, event: string, selector: string): Error
	{
		return new Error(definitionName + '.' + property + ': could not bind "' + event + '" event to element "' + selector + '". Element does not exists.');
	}


	public static hostElementNotFound(definitionName: string, property: string, selector: string): Error
	{
		return new Error(definitionName + '.' + property + ': could not import host element "' + selector + '". Element does not exists.');
	}


	public static canNotDetachElementOutsideOfApplication(element: string): Error
	{
		return new Error('Can not detach root directives from "' + element + '", since it is not part of application.');
	}

}
