import {CONST} from '../Facade/Lang';
import {makeDecorator, makePropDecorator} from '../Util/Decorators';
import {ChangeDetectionStrategy} from '../constants';


declare interface DirectiveOptions
{
	selector: string,
	compileInner?: boolean,
}


declare interface ComponentOptions extends DirectiveOptions
{
	controllerAs?: string,
	changeDetection?: ChangeDetectionStrategy,
	template?: string,
	components?: Array<any>,
	directives?: Array<any>,
	filters?: Array<any>,
	translations?: {[locale: string]: any},
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

	public changeDetection: ChangeDetectionStrategy;

	public template: string;

	public directives: Array<any>;

	public filters: Array<any>;

	public translations: {[locale: string]: any};


	constructor(options: ComponentOptions)
	{
		options.compileInner = true;

		super(options);

		this.controllerAs = typeof options.controllerAs !== 'undefined' ? options.controllerAs : null;
		this.changeDetection = typeof options.changeDetection !== 'undefined' ? options.changeDetection : null;
		this.template = typeof options.template !== 'undefined' ? options.template : null;
		this.directives = typeof options.directives !== 'undefined' ? options.directives : [];
		this.filters = typeof options.filters !== 'undefined' ? options.filters : [];
		this.translations = typeof options.translations !== 'undefined' ? options.translations : {};
	}

}


@CONST()
export class HostEventMetadataDefinition
{


	public el: string;

	public name: string;


	constructor(el: string, name?: string)
	{
		if (!name && typeof el !== 'undefined') {
			name = el;
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
