import {AbstractEntityView} from './AbstractEntityView';
import {View} from '../Views/View';
import {OnDestroy} from '../Interfaces';
import {ElementRef} from '../Templating/ElementRef';
import {ControllerDefinition} from './ControllerParser';


export class ControllerView extends AbstractEntityView
{


	public definition: ControllerDefinition;

	public instance: any;


	constructor(view: View, el: ElementRef, definition: ControllerDefinition, instance: any)
	{
		super(view, el);

		this.definition = definition;
		this.instance = instance;
	}


	public attach(): void
	{
		if (this.definition.metadata.controllerAs) {
			this.view.addParameter(this.definition.metadata.controllerAs, this.instance);
		}
	}


	public detach(): void
	{
		if (typeof this.instance['onDestroy'] === 'function') {
			(<OnDestroy>this.instance).onDestroy();
		}
	}

}
