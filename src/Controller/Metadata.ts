import {CONST} from '../Facade/Lang';
import {makeDecorator, makePropDecorator} from '../Util/Decorators';


declare interface ComponentOptions
{
	name: string;
	template?: string;
}


@CONST()
export class ComponentMetadataDefinition
{


	private name: string;

	private template: string;


	constructor(options: ComponentOptions)
	{
		if (typeof options.name === 'undefined') {
			throw new Error('Missing name options in @Component annotation.');
		}

		this.name = options.name;
		this.template = typeof options.template !== 'undefined' ? options.template : null;
	}


	public getName(): string
	{
		return this.name;
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


	constructor(name?: string)
	{
		this.name = name;
	}


	public hasName(): boolean
	{
		return this.name != null;
	}


	public getName(): string
	{
		return this.name;
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
