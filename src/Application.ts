import {Container} from './DI/Container';
import {Injectable} from './DI/Metadata';
import {Helpers} from './Util/Helpers';
import {IterableDifferFactory} from './ChangeDetection/IterableDiffer';
import {Dom} from "./Util/Dom";
import {DirectiveParser, DirectiveType} from "./Entity/DirectiveParser";
import {RootCompiler} from "./Templating/Compilers/RootCompiler";
import {ApplicationTemplate} from "./Templating/Templates/ApplicationTemplate";
import {ParamsList} from "./Translations/Translator";
import {FilterMetadataDefinition} from "./Templating/Filters/Metadata";
import {Annotations} from "./Util/Annotations";
import {TemplatesStorage} from "./Templating/Templates/TemplatesStorage";


declare interface ApplicationOptions
{
	parentElement?: Element,
	filters?: Array<any>,
	parameters?: ParamsList,
}


@Injectable()
export class Application
{


	private container: Container;


	constructor(container: Container)
	{
		this.container = container;
		this.container.provide(IterableDifferFactory);
	}


	public run(directives: Array<any>|any, options: ApplicationOptions = {}): void
	{
		if (typeof options.parentElement === 'undefined') {
			options.parentElement = <any>document;
		}

		if (typeof options.filters === 'undefined') {
			options.filters = [];
		}
		
		if (!Helpers.isArray(directives)) {
			directives = [directives];
		}

		let template = new ApplicationTemplate(this.container, options.parameters);
		let templatesStorage = new TemplatesStorage;

		for (let i = 0; i < options.filters.length; i++) {
			let filter = options.filters[i];
			let metadata: FilterMetadataDefinition = Annotations.getAnnotation(filter, FilterMetadataDefinition);

			template.addFilter(metadata.name, template.createInstance(filter), metadata.injectTemplate);
		}

		for (let i = 0; i < (<Array<any>>directives).length; i++) {
			let definition = DirectiveParser.parse(directives[i]);
			let found = Dom.querySelectorAll(definition.metadata.selector, options.parentElement);

			if (found.length) {
				let compiler = new RootCompiler(this.container, templatesStorage, template, directives[i], definition);

				for (let j = 0; j < found.length; j++) {
					if (definition.type === DirectiveType.Directive) {
						compiler.processDirective(<HTMLElement>found[j]);
					} else {
						compiler.processComponent(<HTMLElement>found[j]);
					}
				}
			}
		}
	}

}
