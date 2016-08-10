import {Container} from './DI/Container';
import {Injectable} from './DI/Metadata';
import {Compiler} from './Compiler';
import {ApplicationView} from './Views/ApplicationView';


@Injectable()
export class Application
{


	private container: Container;

	private compiler: Compiler;


	constructor(container: Container)
	{
		this.container = container;
		this.compiler = new Compiler(container);

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
