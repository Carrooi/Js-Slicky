import {AbstractEntityView} from './AbstractEntityView';
import {View} from '../Views/View';
import {OnDestroy} from '../Interfaces';
import {ElementRef} from '../Templating/ElementRef';
import {DirectiveDefinition} from './DirectiveParser';


export class DirectiveView extends AbstractEntityView
{


	public definition: DirectiveDefinition;

	public instance: any;


	constructor(view: View, el: ElementRef, definition: DirectiveDefinition, instance: any)
	{
		super(view, el);

		this.definition = definition;
		this.instance = instance;
	}


	public attach(): void
	{

	}


	public detach(): void
	{
		if (typeof this.instance['onDestroy'] === 'function') {
			(<OnDestroy>this.instance).onDestroy();
		}
	}

}
