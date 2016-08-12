import {AbstractView} from './AbstractView';
import {ComponentView} from './ComponentView';
import {ElementRef} from '../Templating/ElementRef';
import {ChangeDetector} from '../ChangeDetection/ChangeDetector';
import {ChangeDetectorRef} from '../ChangeDetection/ChangeDetectorRef';
import {Realm} from '../Util/Realm';
import {Container} from '../DI/Container';
import {DefaultFilters} from '../Templating/Filters/DefaultFilters';
import {ParametersList} from '../Interfaces';


export class ApplicationView extends AbstractView
{


	public container: Container;

	public el: Element;

	public realm: Realm;

	public changeDetector: ChangeDetector;

	public changeDetectorRef: ChangeDetectorRef;

	public controller: any;

	public parameters: ParametersList;


	constructor(container: Container, el: Element, controller: any, parameters: ParametersList = {})
	{
		super();

		this.container = container;
		this.el = el;
		this.controller = controller;
		this.parameters = parameters;
		this.realm = new Realm;
		this.changeDetector = new ChangeDetector(this.parameters);
		this.changeDetectorRef = new ChangeDetectorRef(() => {
			this.changeDetector.check();
		});
	}


	public createApplicationRenderableView(el: Element): ComponentView
	{
		let view = new ComponentView(this.container, this, ElementRef.getByNode(el), this.parameters);

		view.directives = [this.controller];

		for (let i = 0; i < DefaultFilters.length; i++) {
			view.addFilter(DefaultFilters[i]);
		}

		return view;
	}

}
