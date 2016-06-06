import {OnInit, OnUpdate, OnChange} from './Interfaces';
import {Dom} from './Util/Dom';
import {Container} from './DI/Container';
import {Injectable} from './DI/Metadata';
import {ControllerParser, ControllerDefinition} from './Entity/ControllerParser';
import {DirectiveParser, DirectiveDefinition} from './Entity/DirectiveParser';
import {Functions} from './Util/Functions';
import {TextParser} from './Parsers/TextParser';
import {AttributeParser} from './Parsers/AttributeParser';
import {TextBinding} from './Templating/Binding/TextBinding';
import {EventBinding} from './Templating/Binding/EventBinding';
import {PropertyBinding} from './Templating/Binding/PropertyBinding';
import {AttributeBinding} from './Templating/Binding/AttributeBinding';
import {View} from './Views/View';
import {ElementRef, AttributesList} from './Templating/ElementRef';
import {TemplateRef} from './Templating/TemplateRef';
import {Annotations} from './Util/Annotations';
import {Helpers} from './Util/Helpers';
import {ChangedObject} from './Util/Watcher';
import {ComponentMetadataDefinition} from './Entity/Metadata';
import {DirectiveMetadataDefinition} from './Entity/Metadata';
import {ExpressionParser, Expression} from './Parsers/ExpressionParser';
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


	public compile(view: View, controller: any): void
	{
		let metadata = ControllerParser.getControllerMetadata(controller);
		let definition = ControllerParser.parse(controller, metadata);
		let el = Dom.querySelector(definition.metadata.selector, <Element>view.el.nativeEl);

		if (!el) {
			return;
		}

		for (let i = 0; i < DefaultFilters.length; i++) {
			view.addFilter(this.container, DefaultFilters[i]);
		}

		view.directives = [controller];

		this.compileElement(view, <HTMLElement>el);
	}


	public compileNodes(view: View|EmbeddedView, nodes: NodeList|Array<Node>): void
	{
		if (nodes instanceof NodeList) {
			nodes = Helpers.toArray(nodes);
		}

		let getView = (view: View|EmbeddedView, node: Node): View => {
			return view instanceof View ? view : (<EmbeddedView>view).createNodeView(node);
		};

		for (let i = 0; i < nodes.length; i++) {
			let child = nodes[i];

			if (child.nodeType === Node.TEXT_NODE) {
				this.compileText(getView(view, child), <Text>child);

			} else if (child.nodeType === Node.ELEMENT_NODE) {
				if (child.nodeName.toUpperCase() !== 'TEMPLATE') {
					child = this.tryTransformToTemplate(<Element>child);
				}

				let innerView = getView(view, child);

				if (child.nodeName.toUpperCase() === 'TEMPLATE') {
					innerView = View.getByElement(ElementRef.getByNode(child), innerView);

					innerView.createMarker();
					innerView.remove();
				}

				this.compileElement(innerView, <HTMLElement>child);
			}
		}
	}


	public compileElement(parentView: View, el: HTMLElement): void
	{
		let _view: View = null;
		let getView = (needOwn: boolean = false): View => {
			if (_view) {
				return _view;
			}

			if (needOwn) {
				return _view = View.getByElement(ElementRef.getByNode(el), parentView);
			}

			return parentView;
		};

		let attributes = ElementRef.getAttributes(el);

		for (let attrName in attributes) {
			if (attributes.hasOwnProperty(attrName)) {
				let attr = attributes[attrName];

				if (attr.expression === '') {
					continue;
				}

				let expr = ExpressionParser.precompile(attr.expression);

				if (attr.property && Dom.propertyExists(el, attr.name)) {
					getView(true).attachBinding(new PropertyBinding(el, attr.name), expr);
					attr.bound = true;
				}

				if (attr.event) {
					getView(true).attachBinding(new EventBinding(getView(true), el, attr.name, attr.expression), expr);
					attr.bound = true;
				}

				if (!attr.property && !attr.event) {
					let attrExpr = AttributeParser.parse(attr.expression);

					if (attrExpr !== "'" + attr.expression + "'") {
						expr = ExpressionParser.precompile(attrExpr);
						getView(true).attachBinding(new AttributeBinding(el, attr.name), expr);
						attr.bound = true;
					}
				}
			}
		}

		let components: Array<string> = [];
		let innerCompilationNeeded = false;
		let directiveExists = false;

		getView().eachDirective((directive) => {
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
				directiveExists = true;

				if (isComponent) {
					components.push(Functions.getName(directive));
				}

				let instance = this.createDirective(getView(true), definition, el);
				let innerCompiled = this.processDirective(el, getView(true), attributes, definition, instance);

				if (!innerCompiled && definition.metadata.compileInner) {
					innerCompilationNeeded = true;
				}
			}
		});

		if (components.length > 1) {
			throw new Error('Can not attach more than 1 components (' + components.join(', ') + ') to ' + Dom.getReadableName(el) + ' element.');
		}

		if (!directiveExists) {
			innerCompilationNeeded = true;
		}

		Dom.removeCssClass(el, Compiler.CLOAK_CSS_CLASS);

		if (Compiler.IGNORED_ELEMENTS.indexOf(el.nodeName.toUpperCase()) === -1 && innerCompilationNeeded) {
			this.compileNodes(getView(), el.childNodes);
		}
	}


	public compileText(view: View, text: Text): void
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


	private createDirective(view: View, definition: DirectiveDefinition, el: Element): any
	{
		let elementRef = ElementRef.getByNode(el);
		let templateRef = new TemplateRef(elementRef);

		if (definition.metadata instanceof ComponentMetadataDefinition) {
			view.updateWithController(this.container, <ControllerDefinition>definition);
		}

		let instance = this.container.create(<any>definition.directive, [
			{
				service: ElementRef,
				options: {
					useFactory: () => elementRef,
				},
			},
			{
				service: TemplateRef,
				options: {
					useFactory: () => templateRef,
				},
			},
			{
				service: View,
				options: {
					useFactory: () => view,
				},
			},
		]);

		view.attachDirective(definition, instance);

		return instance;
	}


	private tryTransformToTemplate(el: Element): Element
	{
		let parent = el;
		let templateEl: HTMLElement = null;
		let removeAttrs = [];

		for (let i = 0; i < el.attributes.length; i++) {
			let attribute = el.attributes[i];
			if (attribute.name.match(/^\*/)) {
				let templateParent = document.createElement('div');
				templateParent.innerHTML = '<template [' + attribute.name.substr(1) + ']="' + attribute.value + '"></template>';

				let template = <HTMLElement>templateParent.children[0];

				templateParent.removeChild(template);

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


	private processDirective(el: HTMLElement, view: View, attributes: AttributesList, definition: DirectiveDefinition, instance: any): boolean
	{
		let innerCompiled = false;

		let hasOnChange = typeof instance['onChange'] === 'function';
		let hasOnUpdate = typeof instance['onUpdate'] === 'function';

		((instance, definition, hasOnChange, hasOnUpdate) => {
			let processInput = (inputName: string, required: boolean, expr: Expression, changed: Array<ChangedObject> = null) => {
				let stop = false;

				if (hasOnChange) {
					stop = (<OnChange>instance).onChange(inputName, changed) === false;
				}

				if (!stop) {
					let value = ExpressionParser.parse(expr, view.parameters);

					instance[inputName] = value;

					if (hasOnUpdate) {
						(<OnUpdate>instance).onUpdate(inputName, value);
					}
				}
			};

			for (let inputName in definition.inputs) {
				if (definition.inputs.hasOwnProperty(inputName)) {
					let input = definition.inputs[inputName];
					let realInputName = (input.name ? input.name : inputName).toLowerCase();

					let attr = attributes[realInputName];

					if (typeof attr === 'undefined') {
						if (typeof el[realInputName] === 'undefined') {
							if (input.required) {
								throw new Error('Component\'s input ' + Functions.getName(definition.directive) + '::' + inputName + ' was not found in ' + Dom.getReadableName(<Element>el) + ' element.');
							} else if (typeof instance[inputName] !== 'undefined') {
								continue;
							}
						}

						instance[inputName] = el[realInputName];

					} else {
						if (attr.property) {
							let expr = ExpressionParser.precompile(attr.expression);

							processInput(inputName, input.required, expr);

							((inputName, required, expr) => {
								view.watch(expr, (changed) => {
									processInput(inputName, required, expr, changed);
								});
							})(inputName, input.required, expr);
						} else {
							instance[inputName] = attr.expression;
						}

						attr.bound = true;
					}
				}
			}
		})(instance, definition, hasOnChange, hasOnUpdate);

		for (let attrName in attributes) {
			if (attributes.hasOwnProperty(attrName)) {
				let attr = attributes[attrName];

				if (attr.property && !attr.bound) {
					throw new Error('Could not bind property ' + attr.name + ' to element ' + Dom.getReadableName(el) + ' or to any of its directives.');
				}
			}
		}

		if (definition.metadata instanceof ComponentMetadataDefinition && (<ComponentMetadataDefinition>definition.metadata).template) {
			el.innerHTML = (<ComponentMetadataDefinition>definition.metadata).template;
		}

		if (el.innerHTML !== '' && definition.metadata.compileInner) {
			this.compileNodes(view, el.childNodes);
			innerCompiled = true;
		}

		if (definition.metadata instanceof ComponentMetadataDefinition) {
			let elements = (<ControllerDefinition>definition).elements;
			for (let elementName in elements) {
				if (elements.hasOwnProperty(elementName)) {
					let element = elements[elementName];

					if (element.selector) {
						let subElements = Dom.querySelectorAll(element.selector, el);

						if (subElements.length === 0) {
							instance[elementName] = null;

						} else if (subElements.length === 1) {
							instance[elementName] = subElements[0];

						} else {
							instance[elementName] = subElements;
						}
					} else {
						instance[elementName] = el;
					}
				}
			}
		}

		for (let eventName in definition.events) {
			if (definition.events.hasOwnProperty(eventName)) {
				let event = definition.events[eventName];

				if (event.el === '@') {
					Dom.addEventListener(el, event.name, instance, instance[eventName]);

				} else {
					if (typeof event.el === 'string' && (<string>event.el).substr(0, 1) === '@') {
						let childName = (<string>event.el).substr(1);
						if (typeof instance[childName] === 'undefined') {
							throw new Error('Can not add event listener for @' + childName + ' at ' + Functions.getName(instance));
						}

						Dom.addEventListener(instance[childName], event.name, instance, instance[eventName]);

					} else if (typeof event.el === 'string') {
						let eventEls = Dom.querySelectorAll(<string>event.el, el);
						for (let j = 0; j < eventEls.length; j++) {
							Dom.addEventListener(eventEls[j], event.name, instance, instance[eventName]);
						}

					} else if (event.el instanceof Window || event.el instanceof Node) {
						Dom.addEventListener(<Node>event.el, event.name, instance, instance[eventName]);

					}
				}
			}
		}

		if (typeof instance['onInit'] === 'function') {
			(<OnInit>instance).onInit();
		}

		return innerCompiled;
	}

}
