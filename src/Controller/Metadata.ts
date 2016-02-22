import {CONST} from '../Facade/Lang';
import {makeDecorator, makePropDecorator} from '../Util/Decorators';


declare interface ComponentOptions
{
	selector: string;
	name?: string;
	template?: string;
}


@CONST()
export class ComponentMetadataDefinition
{


	private selector: string;

	private name: string;

	private template: string;


	constructor(options: ComponentOptions)
	{
		if (typeof options.selector === 'undefined' && typeof options.name !== 'undefined') {
			console.log('Option @Component::name is deprecated, use selector instead (@Component({selector: \'[data-component="' + options.name + '"]\'})');
			options.selector = '[data-component="' + options.name + '"]';
		}

		if (typeof options.selector === 'undefined') {
			throw new Error('Missing selector option in @Component annotation.');
		}

		this.selector = options.selector;
		this.template = typeof options.template !== 'undefined' ? options.template : null;
	}


	public getSelector(): string
	{
		return this.selector;
	}


	public hasTemplate(): boolean
	{
		return this.template !== null;
	}


	public getTemplate(): string
	{
		return this.template;
	}

}


@CONST()
export class EventMetadataDefinition
{


	private el: string|Node|Window;

	private name: string;


	constructor(el: string|Node|Window, name?: string)
	{
		if (!name && typeof el === 'string') {
			name = <string>el;
			el = '@';

		} else if (!name) {
			throw new Error('Missing name of event');
		}

		this.el = el;
		this.name = name;
	}


	public getEl(): string|Node|Window
	{
		return this.el;
	}


	public getName(): string
	{
		return this.name;
	}

}


@CONST()
export class InputMetadataDefinition
{


	private name: string;

	private propertyInput: boolean = false;


	constructor(name?: string)
	{
		if (name) {
			let m = name.match(/^\[(.+)?]$/);

			if (m) {
				this.name = m[1];
				this.propertyInput = true;
			} else {
				this.name = name;
			}
		}
	}


	public hasName(): boolean
	{
		return this.name != null;
	}


	public getName(): string
	{
		return this.name;
	}


	public isPropertyInput(): boolean
	{
		return this.propertyInput === true;
	}

}


@CONST()
export class ElementMetadataDefinition
{


	private selector: string;


	constructor(selector?: string)
	{
		this.selector = selector;
	}


	public hasSelector(): boolean
	{
		return this.selector != null;
	}


	public getSelector(): string
	{
		return this.selector;
	}

}


export var Component = makeDecorator(ComponentMetadataDefinition);
export var Event = makePropDecorator(EventMetadataDefinition);
export var Input = makePropDecorator(InputMetadataDefinition);
export var Element = makePropDecorator(ElementMetadataDefinition);
