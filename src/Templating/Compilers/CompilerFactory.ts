import {RootCompiler} from './RootCompiler';
import {ApplicationTemplate} from '../Templates/ApplicationTemplate';
import {TemplatesStorage} from '../Templates/TemplatesStorage';
import {Container} from '../../DI/Container';
import {DirectiveDefinition} from '../../Entity/DirectiveParser';
import {ExtensionsManager} from '../../Extensions/ExtensionsManager';


export class CompilerFactory
{


	private container: Container;

	private templatesStorage: TemplatesStorage;

	private extensions: ExtensionsManager;

	private applicationTemplate: ApplicationTemplate;


	public constructor(container: Container, templatesStorage: TemplatesStorage, extensions: ExtensionsManager, applicationTemplate: ApplicationTemplate)
	{
		this.container = container;
		this.templatesStorage = templatesStorage;
		this.extensions = extensions;
		this.applicationTemplate = applicationTemplate;
	}


	public createRootCompiler(directiveType: any, definition: DirectiveDefinition): RootCompiler
	{
		return new RootCompiler(this.container, this.templatesStorage, this.extensions, this.applicationTemplate, directiveType, definition);
	}

}
