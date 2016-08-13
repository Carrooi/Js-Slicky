import {Container} from './DI/Container';
import {Injectable} from './DI/Metadata';
import {Helpers} from './Util/Helpers';
import {Compiler} from './Compiler';
import {ViewFactory} from './Views/ViewFactory';
import {ApplicationView} from './Views/ApplicationView';
import {ElementRef} from './Templating/ElementRef';
import {DirectiveFactory} from './DirectiveFactory';


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

		this.container.provide(Compiler, {
			useFactory: () => this.compiler,
		});

		this.container.provide(Application, {
			useFactory: () => this,
		});
	}


	public run(directives: Array<any>|any, parentEl?: Element): void
	{
		if (!parentEl) {
			parentEl = <any>document;
		}
		
		if (!Helpers.isArray(directives)) {
			directives = [directives];
		}

		setTimeout(() => {
			let elementRef = ElementRef.getByNode(parentEl);
			let view = new ApplicationView(this.container, elementRef, directives);

			for (let i = 0; i < view.directives.length; i++) {
				this.compiler.compile(view, view.directives[i]);
			}
		}, 0);
	}

}
