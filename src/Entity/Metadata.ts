import {CONST} from '../Facade/Lang';
import {makeDecorator, makePropDecorator} from '../Util/Decorators';
import {ChangeDetectionStrategy} from '../constants';


export declare interface DirectiveOptions
{
	selector: string,
	exportAs?: string,
}


export declare interface ComponentOptions extends DirectiveOptions
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

	public exportAs: string;


	constructor(options: DirectiveOptions)
	{
		this.selector = options.selector;
		this.exportAs = typeof options.exportAs !== 'undefined' ? options.exportAs : null;
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


	constructor(name?: string)
	{
		this.name = name ? name : null;
	}

}


@CONST()
export class OutputMetadataDefinition
{


	public name: string = null;


	constructor(name?: string)
	{
		this.name = name ? name : null;
	}

}


@CONST()
export class RequiredMetadataDefinition
{

}


@CONST()
export class ParentComponentDefinition
{


	public type: any;


	constructor(type?: any)
	{
		this.type = type ? type : null;
	}

}


export class ChildDirectiveDefinition
{


	public type: any;

	public required: boolean = false;

	public imported: boolean = false;


	constructor(type: any)
	{
		this.type = type;
	}

}


export let Directive = makeDecorator(DirectiveMetadataDefinition);
export let Component = makeDecorator(ComponentMetadataDefinition);
export let HostEvent = makePropDecorator(HostEventMetadataDefinition);
export let HostElement = makePropDecorator(HostElementMetadataDefinition);
export let Input = makePropDecorator(InputMetadataDefinition);
export let Output = makePropDecorator(OutputMetadataDefinition);
export let Required = makePropDecorator(RequiredMetadataDefinition);
export let ParentComponent = makePropDecorator(ParentComponentDefinition);
export let ChildDirective = makePropDecorator(ChildDirectiveDefinition);
