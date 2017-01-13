import {Container, CustomServiceDefinition} from '../../DI/Container';
import {DirectiveDefinition} from '../../Entity/DirectiveParser';
import {AbstractCompiler} from './AbstractCompiler';
import {ComponentCompiler} from './ComponentCompiler';
import {HTMLAttributeType, AttributeToken} from '../../Parsers/AbstractHTMLParser';
import {BrowserElementParser} from '../../Parsers/BrowserElementParser';
import {ElementRef} from '../ElementRef';
import {AbstractComponentTemplate} from '../Templates/AbstractComponentTemplate';
import {ParametersList, OnInit, OnDestroy} from '../../Interfaces';
import {ApplicationTemplate} from '../Templates/ApplicationTemplate';
import {AbstractTemplate} from '../Templates/AbstractTemplate';
import {Helpers} from '../../Util/Helpers';
import {InputMetadataDefinition, HostElementMetadataDefinition, HostEventMetadataDefinition} from '../../Entity/Metadata';
import {Dom} from '../../Util/Dom';
import {ITemplateStorage} from '../Storages/ITemplateStorage';
import {Errors} from '../../Errors';
import {ExtensionsManager} from '../../Extensions/ExtensionsManager';
import {SafeEval} from '../../Util/SafeEval';


export class RootCompiler extends AbstractCompiler
{


	private container: Container;

	private templatesStorage: ITemplateStorage;

	private extensions: ExtensionsManager;

	private template: ApplicationTemplate;

	private directiveType: any;

	private definition: DirectiveDefinition;


	constructor(container: Container, templatesStorage: ITemplateStorage, extensions: ExtensionsManager, template: ApplicationTemplate, directiveType: any, definition: DirectiveDefinition)
	{
		super();

		this.container = container;
		this.templatesStorage = templatesStorage;
		this.extensions = extensions;
		this.template = template;
		this.directiveType = directiveType;
		this.definition = definition;
	}


	public processDirective(el: HTMLElement): any
	{
		let elementRef = ElementRef.get(el);
		let directive = this.template.attachDirective(this.directiveType, elementRef);
		let node = (new BrowserElementParser).parse(el);

		if (this.definition.parentComponent) {
			throw Errors.parentComponentInRoot(this.definition.name, this.definition.parentComponent.property);
		}

		this.processInputs(this.template, el, node.attributes, directive);
		this.processElements(elementRef, directive);
		this.processEvents(el, elementRef, directive);

		if (typeof directive['onInit'] === 'function') {
			this.template.run(() => (<OnInit>directive).onInit());
		}

		return directive;
	}


	public processComponent(el: HTMLElement, parameters: ParametersList = {}, use: Array<CustomServiceDefinition> = []): AbstractComponentTemplate
	{
		let compiler = new ComponentCompiler(this.container, this.templatesStorage, this.directiveType);
		let elementRef = ElementRef.get(el);
		let node = (new BrowserElementParser).parse(el);

		if (this.definition.parentComponent) {
			throw Errors.parentComponentInRoot(this.definition.name, this.definition.parentComponent.property);
		}

		Helpers.each(this.definition.elements, (property: string, el: HostElementMetadataDefinition) => {
			if (el.selector) {
				compiler.storeElementDirectiveRequest('_r.component', this.definition, node, el.selector, property);
			}
		});

		Helpers.each(this.definition.events, (property: string, event: HostEventMetadataDefinition) => {
			if (event.el !== '@') {
				compiler.storeEventDirectiveRequest('_r.component', this.definition, node, event.el, property, event.name);
			}
		});

		let TemplateType = <any>compiler.compile();
		let template: AbstractComponentTemplate = new TemplateType(this.template, this.directiveType, elementRef, this.container, this.extensions, parameters, null, this.definition.metadata.controllerAs, use);

		this.processInputs(template, el, node.attributes, template.component);

		Helpers.each(this.definition.elements, (property: string, el: HostElementMetadataDefinition) => {
			if (!el.selector) {
				template.component[property] = elementRef;
			}
		});

		Helpers.each(this.definition.events, (property: string, event: HostEventMetadataDefinition) => {
			if (event.el === '@') {
				this.template.addEventListener(elementRef, event.name, (e: Event, elementRef: ElementRef<HTMLElement>) => {
					template.component[property](e, elementRef);
				});
			}
		});

		template.main(
			() => {},
			() => {
				if (typeof template.component['onInit'] === 'function') {
					template.run(() => (<OnInit>template.component).onInit());
				}
			},
			() => {
				if (typeof template.component['onDestroy'] === 'function') {
					(<OnDestroy>template.component).onDestroy();
				}
			}
		);

		return template;
	}


	private processInputs(template: AbstractTemplate, el: HTMLElement, attributes: {[name: string]: AttributeToken}, directive: any): void
	{
		Helpers.each(this.definition.inputs, (name: string, input: InputMetadataDefinition) => {
			let attributeName = input.name === null ? name : input.name;
			let attribute = attributes[attributeName];

			if (typeof attribute === 'undefined') {
				if (input.required) {
					throw Errors.suitableInputNotFound(this.definition.name, name, el.nodeName.toLowerCase());
				}

				return;
			}

			switch (attribute.type) {
				case HTMLAttributeType.NATIVE:
					directive[name] = attribute.value;
					break;
				case HTMLAttributeType.PROPERTY:
				case HTMLAttributeType.EXPRESSION:
					this.template.watchInput(template, directive, name, (_t) => {
						return SafeEval.run('return ' + this.compileExpression(attribute.value), {
							_t: _t,
						});
					});
					break;
			}
		});
	}


	private processElements(el: ElementRef<HTMLElement>, directive: any): void
	{
		Helpers.each(this.definition.elements, (name: string, element: HostElementMetadataDefinition) => {
			if (element.selector) {
				let child = Dom.querySelector(element.selector, el.nativeElement);

				if (!child) {
					throw Errors.hostElementNotFound(this.definition.name, name, element.selector);
				}

				directive[name] = ElementRef.get(<HTMLElement>child);
			} else {
				directive[name] = el;
			}
		});
	}


	private processEvents(el: HTMLElement, elementRef: ElementRef<HTMLElement>, directive: any): void
	{
		Helpers.each(this.definition.events, (name: string, event: HostEventMetadataDefinition) => {
			let children: Array<ElementRef<HTMLElement>>;

			if (event.el === '@') {
				children = [elementRef];
			} else if (event.el.charAt(0) === '@') {
				children = directive[event.el.substr(1)] ? [directive[event.el.substr(1)]] : null;
			} else {
				let found = Dom.querySelectorAll(event.el, el);
				if (found.length) {
					children = [];
					for (let i = 0; i < found.length; i++) {
						children.push(ElementRef.get(<HTMLElement>found[i]));
					}
				}
			}

			if (!children) {
				throw Errors.hostEventElementNotFound(this.definition.name, name, event.name, event.el);
			}

			for (let i = 0; i < children.length; i++) {
				this.template.addEventListener(children[i], event.name, (e: Event, elementRef: ElementRef<HTMLElement>) => {
					directive[name](e, elementRef);
				});
			}
		});
	}

}
