import {Container} from './DI/Container';
import {Injectable} from './DI/Metadata';
import {Compiler} from './Compiler';
import {View} from './Views/View';
import {ElementRef} from './Templating/ElementRef';


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
			useFactory: () => {
				return this.compiler;
			}
		});

		this.container.provide(Application, {
			useFactory: () => {
				return this;
			}
		});
	}


	public run(controller: any): void
	{
		let view = new View(ElementRef.getByNode(document), {});

		this.compiler.compile(view, controller);
		view.watcher.run();
	}

}
