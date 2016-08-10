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
import {ElementRef, AttributesList} from './Templating/ElementRef';
import {TemplateRef} from './Templating/TemplateRef';
import {Annotations} from './Util/Annotations';
import {Helpers} from './Util/Helpers';
import {SafeEval} from './Util/SafeEval';
import {ComponentMetadataDefinition} from './Entity/Metadata';
import {DirectiveMetadataDefinition} from './Entity/Metadata';
import {ExpressionParser} from './Parsers/ExpressionParser';
import {EmbeddedView} from './Views/EmbeddedView';
import {ParametersList} from './Interfaces';


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

		let view = appView.createApplicationComponentView(el);

		this.compileElement(view, <HTMLElement>el);
	}


	public compileNodes(view: ComponentView|EmbeddedView, nodes: NodeList|Array<Node>): void
	{
		if (nodes instanceof NodeList) {
			nodes = Helpers.toArray(nodes);
		}

		let currentView: ComponentView = <ComponentView>view;
		let originalParameters = currentView.parameters;

		if (currentView instanceof EmbeddedView) {
			currentView = (<any>currentView).getView();
			originalParameters = currentView.parameters;

			currentView.parameters = {};
			currentView.addParameters(originalParameters);
			currentView.addParameters(view.parameters);
		}

		let currentParameters = currentView.parameters;

		let i = 0;
		let restoreParametersAfter: number = null;
		let includedNode = 0;

		while (i < nodes.length) {
			let child = nodes[i];

			if (child.nodeType === Node.TEXT_NODE) {
				this.compileText(currentView, <Text>child);

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

					currentView.storeTemplate(templateRef);

				} else if (nodeName === 'CONTENT') {
					let include = this.tryIncludeTemplate(currentView, <Element>child);
					let append = include.nodes;

					currentView.parameters = {};
					currentView.addParameters(currentParameters);
					currentView.addParameters(include.vars);

					restoreParametersAfter = append.length;

					append.splice(0, 0, <any>i, <any>1);
					Array.prototype.splice.apply(nodes, append);
					
					continue;
				}

				this.compileElement(currentView, <HTMLElement>child, templateRef);
			}

			if (restoreParametersAfter !== null) {
				includedNode++;

				if (restoreParametersAfter === includedNode) {
					currentView.parameters = currentParameters;
					includedNode = 0;
					restoreParametersAfter = null;
				}
			}

			i++;
		}

		if (view !== currentView) {
			currentView.parameters = originalParameters;
		}
	}


	public compileElement(parentView: ComponentView, el: HTMLElement, templateRef?: TemplateRef): void
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

				let innerCompiled = this.useDirective(directiveView, definition, el, attributes, templateRef, controllerName);

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


	public compileText(view: ComponentView, text: Text): void
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


	private tryIncludeTemplate(view: ComponentView, el: Element): {nodes: Array<Node>, vars: ParametersList}
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

		let importVars = el.getAttribute('import');
		let importVarsList = {};
		if (importVars && importVars !== '') {
			importVars = 'return {' + importVars + '}';
			importVarsList = SafeEval.run(importVars, view.parameters).result;
		}
		
		let nodes = template.insert(el);

		Dom.remove(el);

		return {
			nodes: nodes,
			vars: importVarsList,
		};
	}


	private useDirective(view: ComponentView, definition: DirectiveDefinition, el: Element, attributes: AttributesList, templateRef?: TemplateRef, controllerName?: string): boolean
	{
		let elementRef = ElementRef.getByNode(el);
		let instance = view.createDirectiveInstance(this.container, definition, elementRef, templateRef);
		let directiveInstance: DirectiveInstance = null;
		let innerCompiled = false;

		if (definition.metadata instanceof ComponentMetadataDefinition) {
			directiveInstance = view.setComponent(this.container, <ControllerDefinition>definition, instance, controllerName);
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
