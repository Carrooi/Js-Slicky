import {AbstractView} from './AbstractView';
import {ComponentView} from './ComponentView';
import {ElementRef} from '../Templating/ElementRef';
import {Watcher} from '../Util/Watcher';
import {Container} from '../DI/Container';
import {DefaultFilters} from '../Templating/Filters/DefaultFilters';
import {ParametersList} from '../Interfaces';


export class ApplicationView extends AbstractView
{


	public container: Container;

	public el: Element;

	public watcher: Watcher;

	public controller: any;

	public parameters: ParametersList;


	constructor(container: Container, el: Element, controller: any, parameters: ParametersList = {})
	{
		super();

		this.container = container;
		this.el = el;
		this.controller = controller;
		this.parameters = parameters;
		this.watcher = new Watcher(parameters);
	}


	public detach(): void
	{
		super.detach();

		this.watcher.stop();
	}


	public createApplicationComponentView(el: Element): ComponentView
	{
		let view = new ComponentView(this, ElementRef.getByNode(el), this.parameters);

		view.directives = [this.controller];

		for (let i = 0; i < DefaultFilters.length; i++) {
			view.addFilter(this.container, DefaultFilters[i]);
		}

		return view;
	}

}
