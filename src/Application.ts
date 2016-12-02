import {Container} from './DI/Container';
import {Injectable} from './DI/Metadata';
import {Helpers} from './Util/Helpers';
import {IterableDifferFactory} from './ChangeDetection/IterableDiffer';
import {Dom} from './Util/Dom';
import {DirectiveParser, DirectiveType} from './Entity/DirectiveParser';
import {ApplicationTemplate} from './Templating/Templates/ApplicationTemplate';
import {ParamsList} from './Translations/Translator';
import {FilterMetadataDefinition} from './Templating/Filters/Metadata';
import {Annotations} from './Util/Annotations';
import {TemplatesStorage} from './Templating/Templates/TemplatesStorage';
import {CompilerFactory} from './Templating/Compilers/CompilerFactory';
import {ExtensionsManager} from './Extensions/ExtensionsManager';
import {AbstractExtension} from './Extensions/AbstractExtension';


export declare interface ApplicationOptions
{
	parentElement?: HTMLElement,
	filters?: Array<any>,
	parameters?: ParamsList,
}


@Injectable()
export class Application
{


	private container: Container;

	private extensions: ExtensionsManager;

	private compilerFactory: CompilerFactory;

	private template: ApplicationTemplate;

	private directives: Array<any>;

	private el: HTMLElement;

	private running: boolean = false;


	constructor(container: Container)
	{
		this.container = container;
		this.container.provide(IterableDifferFactory);

		this.extensions = new ExtensionsManager;
	}


	public addExtension(extension: AbstractExtension): void
	{
		this.container.provide(extension.getServices());
		this.extensions.addExtension(extension);
	}


	private prepare(directives: Array<any>, options: ApplicationOptions = {}): void
	{
		if (typeof options.parentElement === 'undefined') {
			options.parentElement = <any>document;
		}

		if (typeof options.filters === 'undefined') {
			options.filters = [];
		}

		let template = new ApplicationTemplate(this.container, options.parentElement, options.parameters);
		let templatesStorage = new TemplatesStorage;

		let extensionsFilters = this.extensions.getFilters();
		let extensionsDirectives = this.extensions.getDirectives();

		for (let i = 0; i < extensionsFilters.length; i++) {
			options.filters.push(extensionsFilters[i]);
		}

		for (let i = 0; i < extensionsDirectives.length; i++) {
			directives.push(extensionsDirectives[i]);
		}

		for (let i = 0; i < options.filters.length; i++) {
			let filter = options.filters[i];
			let metadata: FilterMetadataDefinition = Annotations.getAnnotation(filter, FilterMetadataDefinition);

			template.addFilter(metadata.name, template.createInstance(filter), metadata.injectTemplate);
		}

		this.el = options.parentElement;
		this.directives = directives;
		this.template = template;
		this.compilerFactory = new CompilerFactory(this.container, templatesStorage, this.extensions, template);

		this.container.provide([
			[
				CompilerFactory,
				{
					useFactory: () => this.compilerFactory,
				},
			],
			[
				ApplicationTemplate,
				{
					useFactory: () => template,
				},
			],
		]);
	}


	public run(directives: Array<any>|any, options: ApplicationOptions = {}): void
	{
		if (this.running) {
			throw new Error('Application.run: can not run application more than once.');
		}

		if (!Helpers.isArray(directives)) {
			directives = [directives];
		}

		this.prepare(directives, options);
		this.compile(this.el);

		this.running = true;
	}


	public attachElement(el: HTMLElement): void
	{
		this.compile(el);
	}


	public detachElement(el: HTMLElement): void
	{
		this.template.detachElement(el);
	}


	private compile(el: HTMLElement): void
	{
		for (let i = 0; i < this.directives.length; i++) {
			let directive = this.directives[i];
			let definition = DirectiveParser.parse(directive);
			let found = Dom.querySelectorAll(definition.metadata.selector, el);

			if (found.length) {
				let compiler = this.compilerFactory.createRootCompiler(directive, definition);

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
