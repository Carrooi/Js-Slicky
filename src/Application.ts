import {Container} from './DI/Container';
import {Injectable} from './DI/Metadata';
import {Helpers} from './Util/Helpers';
import {IterableDifferFactory} from './ChangeDetection/IterableDiffer';
import {Dom} from './Util/Dom';
import {DirectiveParser, DirectiveType} from './Entity/DirectiveParser';
import {ApplicationTemplate} from './Templating/Templates/ApplicationTemplate';
import {FilterMetadataDefinition} from './Templating/Filters/Metadata';
import {Annotations} from './Util/Annotations';
import {MemoryStorage} from './Templating/Storages/MemoryStorage';
import {CompilerFactory} from './Templating/Compilers/CompilerFactory';
import {ExtensionsManager} from './Extensions/ExtensionsManager';
import {AbstractExtension} from './Extensions/AbstractExtension';
import {DefaultFilters} from './Templating/Filters/DefaultFilters';


export declare interface ApplicationOptions
{
	parentElement?: HTMLElement,
	filters?: Array<any>,
}


@Injectable()
export class Application
{


	private container: Container;

	private extensions: ExtensionsManager;

	private compilerFactory: CompilerFactory;

	private template: ApplicationTemplate;

	private directives: Array<any> = [];

	private directivesLoaded: boolean = false;

	private filters: Array<any> = [];

	private filtersLoaded: boolean = false;

	private options: ApplicationOptions;

	private el: HTMLElement;

	private running: boolean = false;


	constructor(container: Container, directives: Array<any>, options: ApplicationOptions = {})
	{
		if (typeof options.parentElement === 'undefined' && document) {
			options.parentElement = <any>document;
		}

		if (typeof options.filters === 'undefined') {
			options.filters = [];
		}

		this.container = container;
		this.options = options;
		this.container.provide(IterableDifferFactory);
		this.container.provide(Application, {
			useFactory: () => this,
		});

		this.extensions = new ExtensionsManager;

		Helpers.each(directives, (i, directive) => {
			if (this.directives.indexOf(directive) < 0) {
				this.directives.push(directive);
			}
		});

		Helpers.each(this.options.filters, (i, filter) => {
			if (this.filters.indexOf(filter) < 0) {
				this.filters.push(filter);
			}
		});
	}


	public addExtension(extension: AbstractExtension): void
	{
		if (this.running) {
			throw new Error('Application.addExtension: can not add new extension when application is running.');
		}

		if (this.directivesLoaded) {
			throw new Error('Application.addExtension: can not add new extension when application is ready to run.');
		}

		this.container.provide(extension.getServices());
		this.extensions.addExtension(extension);
	}


	public getDirectives(): Array<any>
	{
		if (!this.directivesLoaded) {
			let extensionsDirectives = this.extensions.getDirectives();

			for (let i = 0; i < extensionsDirectives.length; i++) {
				if (this.directives.indexOf(extensionsDirectives[i]) < 0) {
					this.directives.push(extensionsDirectives[i]);
				}
			}

			this.directivesLoaded = true;
		}

		return this.directives;
	}


	public getFilters(): Array<any>
	{
		if (!this.filtersLoaded) {
			let extensionsFilters = this.extensions.getFilters();

			for (let i = 0; i < extensionsFilters.length; i++) {
				this.filters.push(extensionsFilters[i]);
			}

			for (let i = 0; i < DefaultFilters.length; i++) {
				this.filters.push(DefaultFilters[i]);
			}

			this.filtersLoaded = true;
		}

		return this.filters;
	}


	private prepare(): void
	{
		let template = new ApplicationTemplate(this.container, this.options.parentElement);
		let storage = new MemoryStorage;

		let filters = this.getFilters();

		for (let i = 0; i < filters.length; i++) {
			let filter = filters[i];
			let metadata: FilterMetadataDefinition = Annotations.getAnnotation(filter, FilterMetadataDefinition);

			template.addFilter(metadata.name, template.createInstance(filter), metadata.injectTemplate);
		}

		this.el = this.options.parentElement;
		this.template = template;
		this.compilerFactory = new CompilerFactory(this.container, storage, this.extensions, template);

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


	public run(): void
	{
		if (this.running) {
			throw new Error('Application.run: can not run application more than once.');
		}

		this.prepare();
		this.compile(this.el);

		this.running = true;
	}


	public attachElement(el: HTMLElement): void
	{
		if (!this.running) {
			throw new Error('Application.attachElement: can not attach element when application is not running.');
		}

		this.compile(el);
	}


	public detachElement(el: HTMLElement): void
	{
		if (!this.running) {
			throw new Error('Application.detachElement: can not detach element when application is not running.');
		}

		this.template.detachElement(el);
	}


	private compile(el: HTMLElement): void
	{
		let directives = this.getDirectives();

		for (let i = 0; i < directives.length; i++) {
			let directive = directives[i];
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
