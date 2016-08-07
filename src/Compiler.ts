import {Dom} from './Util/Dom';
import {Container} from './DI/Container';
import {Injectable} from './DI/Metadata';
import {ControllerParser, ControllerDefinition} from './Entity/ControllerParser';
import {DirectiveParser, DirectiveDefinition} from './Entity/DirectiveParser';
import {DirectiveInstance} from './Entity/DirectiveInstance';
import {ComponentInstance} from './Entity/ComponentInstance';
import {TextParser} from './Parsers/TextParser';
import {AttributeParser} from './Parsers/AttributeParser';
import {TextBinding} from './Templating/Binding/TextBinding';
import {EventBinding} from './Templating/Binding/EventBinding';
import {PropertyBinding} from './Templating/Binding/PropertyBinding';
import {AttributeBinding} from './Templating/Binding/AttributeBinding';
import {ComponentView} from './Views/ComponentView';
import {ApplicationView} from './Views/ApplicationView';
import {AbstractView} from './Views/AbstractView';
import {ElementRef, AttributesList} from './Templating/ElementRef';
import {TemplateRef} from './Templating/TemplateRef';
import {Annotations} from './Util/Annotations';
import {Helpers} from './Util/Helpers';
import {ComponentMetadataDefinition} from './Entity/Metadata';
import {DirectiveMetadataDefinition} from './Entity/Metadata';
import {ExpressionParser} from './Parsers/ExpressionParser';
import {EmbeddedView} from './Views/EmbeddedView';
import {DefaultFilters} from './Templating/Filters/DefaultFilters';


@Injectable()
export class Compiler
{


	public static FILTER_DELIMITER = '|';
	public static FILTER_ARGUMENT_DELIMITER = ':';

	public static CLOAK_CSS_CLASS = 'slicky-cloak';

	public static IGNORED_ELEMENTS = ['SCRIPT', 'STYLE', 'TEMPLATE'];


	private container: Container;


	constructor(container: Container)
	{
		this.container = container;
	}


	public compile(appView: ApplicationView): void
	{
		let controller = appView.controller;
		let metadata = ControllerParser.getControllerMetadata(controller);
		let definition = ControllerParser.parse(controller, metadata);
		let el = Dom.querySelector(definition.metadata.selector, appView.el);

		if (!el) {
			return;
		}

		for (let i = 0; i < DefaultFilters.length; i++) {
			appView.addFilter(this.container, DefaultFilters[i]);
		}

		let view = appView.createApplicationComponentView(el);

		this.compileElement(view, <HTMLElement>el);
	}


	public compileNodes(view: AbstractView, nodes: NodeList|Array<Node>): void
	{
		if (nodes instanceof NodeList) {
			nodes = Helpers.toArray(nodes);
		}

		for (let i = 0; i < nodes.length; i++) {
			let child = nodes[i];

			if (child.nodeType === Node.TEXT_NODE) {
				this.compileText(view, <Text>child);

			} else if (child.nodeType === Node.ELEMENT_NODE) {
				if (child.nodeName.toUpperCase() !== 'TEMPLATE') {
					child = this.tryTransformToTemplate(<Element>child);
				}

				let innerView = view;
				let originalParameters = null;

				if (innerView instanceof EmbeddedView) {
					innerView = (<EmbeddedView>innerView).getView();
					originalParameters = innerView.parameters;
					innerView.parameters = view.parameters;
				}

				if (child.nodeName.toUpperCase() === 'TEMPLATE') {
					let el = ElementRef.getByNode(child);

					el.createMarker();
					el.remove();
				}

				this.compileElement(<ComponentView>innerView, <HTMLElement>child);

				if (originalParameters !== null) {
					innerView.parameters = originalParameters;
				}
			}
		}
	}


	public compileElement(parentView: ComponentView, el: HTMLElement): void
	{
		let attributes = ElementRef.getAttributes(el);

		for (let attrName in attributes) {
			if (attributes.hasOwnProperty(attrName)) {
				let attr = attributes[attrName];

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

		let innerCompilationNeeded = false;
		let directiveExists = false;

		parentView.eachDirective((directive) => {
			let isComponent = false;
			let metadata: DirectiveMetadataDefinition;
			let definition: DirectiveDefinition;

			if (Annotations.hasAnnotation(directive, ComponentMetadataDefinition)) {
				isComponent = true;
				metadata = ControllerParser.getControllerMetadata(directive);
				definition = ControllerParser.parse(directive, <ComponentMetadataDefinition>metadata);
			} else {
				metadata = DirectiveParser.getDirectiveMetadata(directive);
				definition = DirectiveParser.parse(directive, metadata);
			}

			if (Dom.matches(el, metadata.selector)) {
				let directiveView = parentView;
				directiveExists = true;

				if (isComponent) {
					directiveView = parentView.fork(ElementRef.getByNode(el));
				}

				let innerCompiled = this.useDirective(directiveView, definition, el, attributes);

				if (!innerCompiled && definition.metadata.compileInner) {
					innerCompilationNeeded = true;
				}
			}
		});

		if (!directiveExists) {
			innerCompilationNeeded = true;
		}

		Dom.removeCssClass(el, Compiler.CLOAK_CSS_CLASS);

		if (Compiler.IGNORED_ELEMENTS.indexOf(el.nodeName.toUpperCase()) === -1 && innerCompilationNeeded) {
			this.compileNodes(parentView, el.childNodes);
		}
	}


	public compileText(view: AbstractView, text: Text): void
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


	private useDirective(view: ComponentView, definition: DirectiveDefinition, el: Element, attributes: AttributesList): boolean
	{
		let elementRef = ElementRef.getByNode(el);
		let templateRef = new TemplateRef(elementRef);

		let instance = view.createDirectiveInstance(this.container, definition, elementRef, templateRef);
		let directiveInstance: DirectiveInstance = null;
		let innerCompiled = false;

		if (definition.metadata instanceof ComponentMetadataDefinition) {
			directiveInstance = view.setComponent(this.container, <ControllerDefinition>definition, instance);
		} else {
			directiveInstance = view.attachDirective(definition, instance, el);
		}

		directiveInstance.bindInputs(attributes);

		if (directiveInstance instanceof ComponentInstance) {
			innerCompiled = directiveInstance.processInnerHTML(this);
			directiveInstance.processHostElements();
		}

		directiveInstance.processHostEvents();
		directiveInstance.attach();

		return innerCompiled;
	}

}
