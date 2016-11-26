import {Container} from '../../DI/Container';
import {DirectiveDefinition} from '../../Entity/DirectiveParser';
import {AbstractCompiler} from './AbstractCompiler';
import {ComponentCompiler} from './ComponentCompiler';
import {HTMLParser, HTMLAttributeType} from '../../Parsers/HTMLParser';
import {ElementRef} from '../ElementRef';
import {AbstractComponentTemplate} from '../Templates/AbstractComponentTemplate';
import {ParametersList, Expression, OnInit} from '../../Interfaces';
import {ApplicationTemplate} from '../Templates/ApplicationTemplate';
import {Helpers} from "../../Util/Helpers";
import {
	InputMetadataDefinition, HostElementMetadataDefinition,
	HostEventMetadataDefinition
} from "../../Entity/Metadata";
import {Dom} from "../../Util/Dom";


export class RootCompiler extends AbstractCompiler
{


	private container: Container;

	private template: ApplicationTemplate;

	private directiveType: any;

	private definition: DirectiveDefinition;


	constructor(container: Container, template: ApplicationTemplate, directiveType: any, definition: DirectiveDefinition)
	{
		super();

		this.container = container;
		this.template = template;
		this.directiveType = directiveType;
		this.definition = definition;
	}


	public processDirective(el: HTMLElement): any
	{
		let elementRef = ElementRef.get(el);
		let directive = this.template.attachDirective(this.directiveType, elementRef);

		this.processInputs(el, directive);
		this.processElements(el, directive);
		this.processEvents(el, elementRef, directive);

		if (typeof directive['onInit'] === 'function') {
			(<OnInit>directive).onInit();
		}

		return directive;
	}


	public processComponent(el: HTMLElement, parameters: ParametersList = {}): AbstractComponentTemplate
	{
		let compiler = new ComponentCompiler(this.container, this.directiveType);
		let elementRef = ElementRef.get(el);

		let TemplateType = <any>compiler.compile();
		let template: AbstractComponentTemplate = new TemplateType(this.template, this.directiveType, elementRef, this.container, parameters, null, this.definition.metadata.controllerAs);

		//this.processInputs(el, template.component);
		//this.processElements(el, template.component);
		//this.processEvents(el, elementRef, template.component);

		template.main(() => {
			if (typeof template.component['onInit'] === 'function') {
				(<OnInit>template.component).onInit();
			}
		});

		return template;
	}


	private processInputs(el: HTMLElement, directive: any): void
	{
		let attributes = HTMLParser.parseAttributes(el, {
			replaceGlobalRoot: '_t.scope.findParameter("%root")',
		});

		Helpers.each(this.definition.inputs, (name: string, input: InputMetadataDefinition) => {
			let attributeName = input.name === null ? name : input.name;
			let attribute = attributes[attributeName];

			if (typeof attribute === 'undefined') {
				if (input.required) {
					throw new Error(this.definition.name + '.' + name + ': could not find any suitable input in "' + el.nodeName.toLowerCase() + '" element.');
				}

				return;
			}

			switch (attribute.type) {
				case HTMLAttributeType.NATIVE:
					directive[name] = attribute.value;
					break;
				case HTMLAttributeType.PROPERTY:
				case HTMLAttributeType.EXPRESSION:
					this.template.watchInput(directive, name, <Expression>attribute.value);
					break;
			}
		});
	}


	private processElements(el: HTMLElement, directive: any): void
	{
		Helpers.each(this.definition.elements, (name: string, element: HostElementMetadataDefinition) => {
			let child = Dom.querySelector(element.selector, el);

			if (!child) {
				throw new Error(this.definition.name + '.' + name + ': could not find child element "' + element.selector + '".');
			}

			directive[name] = ElementRef.get(<HTMLElement>child);
		});
	}


	private processEvents(el: HTMLElement, elementRef: ElementRef, directive: any): void
	{
		Helpers.each(this.definition.events, (name: string, event: HostEventMetadataDefinition) => {
			let child: ElementRef;

			if (event.el === '@') {
				child = elementRef;
			} else if (event.el.charAt(0) === '@') {
				child = directive[event.el.substr(1)];
			} else {
				let childNode = <HTMLElement>Dom.querySelector(event.el, el);
				if (childNode) {
					child = ElementRef.get(childNode);
				}
			}

			if (!child) {
				throw new Error(this.definition.name + '.' + name + ': could not find child element "' + event.el + '" for event.');
			}

			this.template.addEventListener(child, event.name, (e: Event, elementRef: ElementRef) => {
				directive[name](e, elementRef);
			});
		});
	}

}
