import {Container} from './DI/Container';
import {Injectable} from './DI/Metadata';
import {Helpers} from './Util/Helpers';
import {Compiler} from './Compiler';
import {ViewFactory} from './Views/ViewFactory';
import {ApplicationView} from './Views/ApplicationView';
import {ElementRef} from './Templating/ElementRef';
import {DirectiveFactory} from './DirectiveFactory';
import {IterableDifferFactory} from './ChangeDetection/IterableDiffer';


declare interface ApplicationOptions
{
	parentElement?: Element,
	filters?: Array<any>,
}


@Injectable()
export class Application
{


	private container: Container;

	private compiler: Compiler;


	constructor(container: Container)
	{
		this.container = container;

		let viewFactory = new ViewFactory(this.container);
		let directiveFactory = new DirectiveFactory(this.container, viewFactory);

		this.compiler = new Compiler(container, viewFactory, directiveFactory);

		this.container.provide(ViewFactory, {
			useFactory: () => viewFactory,
		});

		this.container.provide(DirectiveFactory, {
			useFactory: () => directiveFactory,
		});

		this.container.provide(IterableDifferFactory);

		this.container.provide(Compiler, {
			useFactory: () => this.compiler,
		});

		this.container.provide(Application, {
			useFactory: () => this,
		});
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

		setTimeout(() => {
			let elementRef = ElementRef.getByNode(options.parentElement);
			let view = new ApplicationView(this.container, elementRef, directives);

			this.container.provide(ApplicationView, {
				useFactory: () => view,
			});

			for (let i = 0; i < options.filters.length; i++) {
				view.addFilter(options.filters[i]);
			}

			this.compiler.compile(view);
		}, 0);
	}

}
