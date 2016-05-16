import {CONST} from '../Facade/Lang';
import {makeDecorator, makePropDecorator} from '../Util/Decorators';


declare interface DirectiveOptions
{
	selector: string,
	compileInner?: boolean,
}


declare interface ComponentOptions extends DirectiveOptions
{
	controllerAs?: string,
	template?: string,
	components?: Array<any>,
	directives?: Array<any>,
	filters?: {[name: string]: Function},
}


@CONST()
export class DirectiveMetadataDefinition
{


	public selector: string;

	public compileInner: boolean;


	constructor(options: DirectiveOptions)
	{
		this.selector = options.selector;
		this.compileInner = options.compileInner ? true : false;
	}

}


@CONST()
export class ComponentMetadataDefinition extends DirectiveMetadataDefinition
{


	public controllerAs: string;

	public template: string;

	public directives: Array<any>;

	public filters: {[name: string]: Function};


	constructor(options: ComponentOptions)
	{
		options.compileInner = true;

		super(options);

		this.controllerAs = typeof options.controllerAs !== 'undefined' ? options.controllerAs : null;
		this.template = typeof options.template !== 'undefined' ? options.template : null;
		this.directives = typeof options.directives !== 'undefined' ? options.directives : [];
		this.filters = typeof options.filters !== 'undefined' ? options.filters : {};
	}

}


@CONST()
export class HostEventMetadataDefinition
{


	public el: string|Node|Window;

	public name: string;


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

}


@CONST()
export class HostElementMetadataDefinition
{


	public selector: string;


	constructor(selector?: string)
	{
		this.selector = selector ? selector : null;
	}

}


@CONST()
export class InputMetadataDefinition
{


	public name: string = null;

	public required: boolean = false;

	public expression: string = null;


	constructor(name?: string)
	{
		this.name = name ? name : null;
	}

}


@CONST()
export class RequiredMetadataDefinition
{

}


export var Directive = makeDecorator(DirectiveMetadataDefinition);

export var Component = makeDecorator(ComponentMetadataDefinition);
export var HostEvent = makePropDecorator(HostEventMetadataDefinition);
export var HostElement = makePropDecorator(HostElementMetadataDefinition);
export var Input = makePropDecorator(InputMetadataDefinition);
export var Required = makePropDecorator(RequiredMetadataDefinition);
