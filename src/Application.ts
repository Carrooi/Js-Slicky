import {Container} from './DI/Container';
import {Injectable} from './DI/Metadata';
import {Compiler} from './Compiler';
import {ViewFactory} from './Views/ViewFactory';
import {ApplicationView} from './Views/ApplicationView';
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


	public run(controller: any): void
	{
		setTimeout(() => {
			let view = new ApplicationView(this.container, <any>document, controller);
			this.compiler.compile(view);
		}, 0);
	}

}
