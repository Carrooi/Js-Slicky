import {Dom} from './Util/Dom';
import {Container} from './DI/Container';
import {Injectable} from './DI/Metadata';
import {ControllerParser} from './Entity/ControllerParser';
import {DirectiveParser, DirectiveDefinition} from './Entity/DirectiveParser';
import {DirectiveInstance} from './Entity/DirectiveInstance';
import {ComponentInstance} from './Entity/ComponentInstance';
import {TextParser} from './Parsers/TextParser';
import {AttributeParser} from './Parsers/AttributeParser';
import {TextBinding} from './Templating/Binding/TextBinding';
import {EventBinding} from './Templating/Binding/EventBinding';
import {PropertyBinding} from './Templating/Binding/PropertyBinding';
import {AttributeBinding} from './Templating/Binding/AttributeBinding';
import {RenderableView} from './Views/RenderableView';
import {ComponentView} from './Views/ComponentView';
import {ApplicationView} from './Views/ApplicationView';
import {ElementRef, AttributesList} from './Templating/ElementRef';
import {TemplateRef} from './Templating/TemplateRef';
import {Annotations} from './Util/Annotations';
import {Helpers} from './Util/Helpers';
import {SafeEval} from './Util/SafeEval';
import {ComponentMetadataDefinition} from './Entity/Metadata';
import {DirectiveMetadataDefinition} from './Entity/Metadata';
import {ExpressionParser} from './Parsers/ExpressionParser';
import {ViewFactory} from './Views/ViewFactory';
import {EmbeddedView} from './Views/EmbeddedView';
import {DirectiveFactory} from './DirectiveFactory';


@Injectable()
export class Compiler
{


	public static FILTER_DELIMITER = '|';
	public static FILTER_ARGUMENT_DELIMITER = ':';

	public static CLOAK_CSS_CLASS = 'slicky-cloak';

	public static IGNORED_ELEMENTS = ['SCRIPT', 'STYLE', 'TEMPLATE'];


	private container: Container;

	private directiveFactory: DirectiveFactory;

	private viewFactory: ViewFactory;


	constructor(container: Container, viewFactory: ViewFactory, directiveFactory: DirectiveFactory)
	{
		this.container = container;
		this.viewFactory = viewFactory;
		this.directiveFactory = directiveFactory;
	}


	public compile(appView: ApplicationView, directive: any): void
	{
		let directiveData = this.processDirectiveMetadata(directive);
		let matches = Dom.querySelectorAll(directiveData.metadata.selector, <Element>appView.el.nativeEl);

		for (let i = 0; i < matches.length; i++) {
			let el = matches[i];

			let elementRef = ElementRef.getByNode(el);
			let attributes = ElementRef.getAttributes(el);

			let componentName = this.getComponentName(attributes);
			let instance = this.directiveFactory.create(appView, directiveData.definition, elementRef);

			this.useDirective(instance, attributes, componentName);
		}
	}


	public createComponent(parentView: ComponentView, template: string): HTMLElement
	{
		let el = Dom.el(template);
		this.compileElement(parentView, el);

		return el;
	}


	public compileNodes(view: RenderableView, nodes: NodeList|Array<Node>): void
	{
		if (nodes instanceof NodeList) {
			nodes = Helpers.toArray(nodes);
		}

		let originalView = view;

		let i = 0;
		let restoreViewAfter: number = null;
		let includedNode = 0;

		while (i < nodes.length) {
			let child = nodes[i];

			if (child.nodeType === Node.TEXT_NODE) {
				this.compileText(view, <Text>child);

			} else if (child.nodeType === Node.ELEMENT_NODE) {
				let templateRef: TemplateRef = null;
				let nodeName = child.nodeName.toUpperCase();

				if (nodeName !== 'TEMPLATE') {
					child = this.tryTransformToTemplate(<Element>child);
					nodeName = child.nodeName.toUpperCase();
				}

				if (nodeName === 'TEMPLATE') {
					let el = ElementRef.getByNode(child);

					templateRef = new TemplateRef(el);
					templateRef.storeElement();

					view.storeTemplate(templateRef);

				} else if (nodeName === 'CONTENT') {
					view = this.tryIncludeTemplate(view, <Element>child);

					let append = (<EmbeddedView>view).nodes;

					restoreViewAfter = append.length;

					append.splice(0, 0, <any>i, <any>1);
					Array.prototype.splice.apply(nodes, append);
					
					continue;
				}

				this.compileElement(view, <HTMLElement>child, templateRef);
			}

			if (restoreViewAfter !== null) {
				includedNode++;

				if (restoreViewAfter === includedNode) {
					view = originalView;
					includedNode = 0;
					restoreViewAfter = null;
				}
			}

			i++;
		}
	}


	public compileElement(parentView: RenderableView, el: HTMLElement, templateRef?: TemplateRef): void
	{
		let attributes = ElementRef.getAttributes(el);
		let controllerName: string = null;

		for (let attrName in attributes) {
			if (attributes.hasOwnProperty(attrName)) {
				let attr = attributes[attrName];

				if (attr.controllerName) {
					controllerName = attr.name;
					attr.bound = true;
					continue;
				}

				if (attr.expression === '') {
					continue;
				}

				let expr = ExpressionParser.precompile(attr.expression);

				if (attr.property && Dom.propertyExists(el, attr.name)) {
					parentView.attachBinding(new PropertyBinding(el, attr.name), expr);
					attr.bound = true;
				}

				if (attr.event) {
					parentView.attachBinding(new EventBinding(parentView, el, attr.name, attr.expression), expr);
					attr.bound = true;
				}

				if (!attr.property && !attr.event) {
					let attrExpr = AttributeParser.parse(attr.expression);

					if (attrExpr !== "'" + attr.expression + "'") {
						expr = ExpressionParser.precompile(attrExpr);
						parentView.attachBinding(new AttributeBinding(el, attr.name), expr);
						attr.bound = true;
					}
				}
			}
		}

		let compileInner = true;

		parentView.eachDirective((directive) => {
			let directiveData = this.processDirectiveMetadata(directive);

			if (Dom.matches(el, directiveData.metadata.selector)) {
				let instance = this.directiveFactory.create(parentView, directiveData.definition, ElementRef.getByNode(el), templateRef);
				this.useDirective(instance, attributes, controllerName);

				if (instance instanceof ComponentInstance || !directiveData.definition.metadata.compileInner) {
					compileInner = false;
				}
			}
		});

		Dom.removeCssClass(el, Compiler.CLOAK_CSS_CLASS);

		if (Compiler.IGNORED_ELEMENTS.indexOf(el.nodeName.toUpperCase()) === -1 && compileInner) {
			this.compileNodes(parentView, el.childNodes);
		}
	}


	public compileText(view: RenderableView, text: Text): void
	{
		let tokens = TextParser.parse(text.nodeValue);

		if (tokens.length > 1 || (tokens.length === 1 && tokens[0].type !== TextParser.TYPE_TEXT)) {
			for (let i = 0; i < tokens.length; i++) {
				let token = tokens[i];
				let newText = document.createTextNode(token.value);

				text.parentNode.insertBefore(newText, text);

				if (token.type === TextParser.TYPE_BINDING) {
					let expr = ExpressionParser.precompile(token.value);
					view.attachBinding(new TextBinding(newText, expr, view), expr);
				}
			}

			text.parentNode.removeChild(text);
		}
	}


	private tryTransformToTemplate(el: Element): Element
	{
		let parent = el;
		let templateEl: HTMLElement = null;
		let removeAttrs = [];

		for (let i = 0; i < el.attributes.length; i++) {
			let attribute = el.attributes[i];
			if (attribute.name.match(/^\*/)) {
				let template = Dom.el('<template [' + attribute.name.substr(1) + ']="' + attribute.value + '"></template>');

				if (templateEl) {
					templateEl.appendChild(template);
				} else {
					parent = template;
				}

				removeAttrs.push(attribute.name);

				templateEl = template;
			}
		}

		if (templateEl) {
			for (let i = 0; i < removeAttrs.length; i++) {
				el.removeAttribute(removeAttrs[i]);
			}

			el.parentElement.insertBefore(parent, el);

			if (templateEl['content']) {
				templateEl['content'].appendChild(el);
			} else {
				templateEl.appendChild(el);
			}
		}

		return parent
	}


	private tryIncludeTemplate(view: RenderableView, el: Element): EmbeddedView
	{
		let id = el.getAttribute('select');
		if (!id.match(/^#[A-Za-z]+[\w\-:\.]*$/)) {
			throw new Error('Can not include template by selector "' + id + '". The only supported selector in <content> is ID attribute.');
		}

		id = id.substring(1);

		let template = view.findTemplate(id);
		if (!template) {
			throw new Error('Can not find template with ID "' + id + '".');
		}

		let innerView = this.viewFactory.createEmbeddedView(view, template);
		let importVars = el.getAttribute('import');

		innerView.attach(el);

		let setInnerVars = (init: boolean = false) => {
			let importVarsList = SafeEval.run('return {' + importVars + '}', view.parameters).result;

			if (init) {
				innerView.addParameters(importVarsList);
			} else {
				for (let name in importVarsList) {
					if (importVarsList.hasOwnProperty(name)) {
						innerView.parameters[name] = importVarsList[name];
					}
				}
			}
		};

		if (importVars && importVars !== '') {
			setInnerVars(true);
			view.watch(ExpressionParser.precompile(importVars), () => {
				setInnerVars();
				innerView.changeDetectorRef.refresh();
			});
		}

		Dom.remove(el);

		return innerView;
	}


	private useDirective(instance: DirectiveInstance, attributes: AttributesList, controllerName?: string): void
	{
		if (instance instanceof ComponentInstance) {
			instance.view.setComponent(instance, controllerName);
		} else {
			instance.view.attachDirective(instance);
		}

		instance.bindInputs(attributes);

		if (instance instanceof ComponentInstance) {
			instance.processInnerHTML();
			
			if (instance.definition.metadata.compileInner) {
				this.compileNodes(instance.view, instance.el.childNodes);
			}
			
			instance.processHostElements();
		}

		instance.processHostEvents();
		instance.attach();
	}


	private getComponentName(attributes: AttributesList): string
	{
		for (let attrName in attributes) {
			if (attributes.hasOwnProperty(attrName)) {
				let attr = attributes[attrName];

				if (attr.controllerName) {
					return attr.name;
				}
			}
		}

		return null;
	}


	private processDirectiveMetadata(directive: any): {metadata: DirectiveMetadataDefinition, definition: DirectiveDefinition}
	{
		let metadata: DirectiveMetadataDefinition;
		let definition: DirectiveDefinition;

		if (Annotations.hasAnnotation(directive, ComponentMetadataDefinition)) {
			metadata = ControllerParser.getControllerMetadata(directive);
			definition = ControllerParser.parse(directive, <ComponentMetadataDefinition>metadata);
		} else {
			metadata = DirectiveParser.getDirectiveMetadata(directive);
			definition = DirectiveParser.parse(directive, metadata);
		}

		return {
			metadata: metadata,
			definition: definition,
		};
	}

}
