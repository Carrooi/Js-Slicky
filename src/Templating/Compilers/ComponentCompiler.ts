import {Strings} from '../../Util/Strings';
import {DirectiveDefinition, DirectiveParser, DirectiveType} from '../../Entity/DirectiveParser';
import {ClassGenerator} from '../../Util/CodeGenerator/ClassGenerator';
import {AbstractComponentTemplate} from '../Templates/AbstractComponentTemplate';
import {ElementRef} from '../ElementRef';
import {TemplateRef} from '../TemplateRef';
import {Helpers} from '../../Util/Helpers';
import {
	HostElementMetadataDefinition, InputMetadataDefinition, HostEventMetadataDefinition, OutputMetadataDefinition,
	ChildDirectiveDefinition, ChildrenDirectiveDefinition
} from '../../Entity/Metadata';
import {Annotations} from '../../Util/Annotations';
import {HTMLAttributeType, HTMLTokenType, AttributeToken, StringToken, ElementToken} from '../../Parsers/AbstractHTMLParser';
import {HTMLParser} from '../../Parsers/HTMLParser';
import {QuerySelector} from '../QuerySelector';
import {Container} from '../../DI/Container';
import {Dom} from '../../Util/Dom';
import {FilterMetadataDefinition} from '../Filters/Metadata';
import {Functions} from '../../Util/Functions';
import {Buffer} from '../../Util/Buffer';
import {AbstractCompiler} from './AbstractCompiler';
import {ITemplateStorage} from '../Storages/ITemplateStorage';
import {Errors} from '../../Errors';
import {ParametersList} from '../../Interfaces';


enum ChildRequestType
{
	Event,
	Element,
}

declare interface ChildRequest
{
	type: ChildRequestType,
	selector: string,
	imported: boolean,
	listener?: string,
	event?: string,
	property?: string,
}

declare interface ChildRequestDirective
{
	definition: DirectiveDefinition,
	parent: ElementToken,
	requests: Array<ChildRequest>,
}

declare interface ChildRequests
{
	[directiveLocalName: string]: ChildRequestDirective
}

declare interface ElementDefinition
{
	elementRef: boolean,
	init: Array<string>,
	directives: Array<{
		localName: string,
		definition: DirectiveDefinition,
		directiveType: any,
		init: boolean,
		outputs: {[eventName: string]: string},
	}>,
	component?: {
		localName: string,
		definition: DirectiveDefinition,
		componentType: any,
		outputs: {[eventName: string]: string},
	}
}


/**
 * Compiles template class for given component
 *
 * Local variables:
 * 		- _c: instance of current component
 * 		- _r: instance of root component template
 * 		- _t: current template (may be EmbeddedTemplate)
 * 		- _d: current local directive instance
 * 		- _d_[0-9]+: global directive container {d: any (directive instance), t: AbstractTemplate}
 * 		- _n: currently processed HTML node
 * 		- _b: HTML node indicating where the next node should be put in DOM (insert before _b)
 * 		- _er: instance of ElementRef for current HTML node
 * 		- _tr: instance of TemplateRef for current HTMLTemplateElement
 *
 */
export class ComponentCompiler extends AbstractCompiler
{


	public static PLACEHOLDER_COMMENT = '__slicky_data__';

	private static counter = 0;


	private templates: Array<ElementToken> = [];

	private directivesCount: number = 0;

	private storage: ITemplateStorage;

	private container: Container;

	private parent: ComponentCompiler;

	private name: string = null;

	private component: any;

	private template: ClassGenerator;

	private definition: DirectiveDefinition;

	private directives: Array<{directive: any, definition: DirectiveDefinition}> = null;

	private directiveRequests: ChildRequests = {};

	private inTemplate: boolean = false;


	constructor(container: Container, storage: ITemplateStorage, component: any, parent?: ComponentCompiler)
	{
		super();

		ComponentCompiler.counter++;

		this.container = container;
		this.storage = storage;
		this.component = component;

		if (parent) {
			this.parent = parent;
		}
	}


	public getName(): string
	{
		if (this.name === null) {
			this.name = this.getCompilerTemplateName(this.getDefinition());
		}

		return this.name;
	}


	public compile(): Function
	{
		let name = this.getName();

		if (!this.storage.isTemplateExists(name)) {
			this.storage.save(name, this._compile());
		}

		return this.storage.getTemplate(name);
	}


	public _compile(): Function
	{
		this.template = new ClassGenerator(this.getName(), 'Template');

		let definition = this.getDefinition();
		let html = (new HTMLParser).parse(definition.metadata.template);

		this.templateExports = html.exports;

		let main = this.template.addMethod('main', ['onBeforeRender', 'onReady', 'onDestroy'], [
			'this.onDestroy.push(onDestroy);',
			'var _r, _t = _r = this;',
			'var _c = _r.component;',
			'var _n = this.elementRef.nativeElement;',
			'var _er = this.elementRef;',
			'var _tr = this.templateRef;',
			'_n.innerHTML = "";',
		]);

		let mainBody = main.getBody();

		if (definition.metadata.changeDetection !== null) {
			mainBody.append('_r.changeDetectorStrategy = ' + definition.metadata.changeDetection + ';');
		}

		if (Object.keys(definition.metadata.translations)) {
			mainBody.append('_r.translations = ' + JSON.stringify(definition.metadata.translations) + ';');
		}

		this.compileFilters(mainBody);

		mainBody.append('onBeforeRender(_r, _t);');

		this.compileBranch(mainBody, html.tree, false);
		this.checkDirectiveRequests(mainBody, ['_r.component']);

		Helpers.each(definition.childDirectives, (property: string, child: ChildDirectiveDefinition) => {
			if (child.required && !child.imported) {
				throw Errors.missingRequiredChildDirective(definition.name, property, Functions.getName(child.type));
			}
		});

		mainBody.append('onReady(_r, _t);');
		mainBody.append('return _r;');

		let scope = this.getTemplateScope();

		return this.template.generate(scope);
	}


	public getTemplateScope(): ParametersList
	{
		let scope = {
			Template: AbstractComponentTemplate,
			ElementRef: ElementRef,
			TemplateRef: TemplateRef,
		};

		this.eachFilter((filterType, definition) => {
			scope[this.getFilterTemplateImportName(definition)] = filterType;
		});

		this.eachDirective((directiveType, definition) => {
			scope[this.getDirectiveTemplateImportName(definition)] = directiveType;

			if (definition.type === DirectiveType.Component) {
				let templateName = this.getCompilerTemplateName(definition);

				if (this.storage.isTemplateExists(templateName)) {
					scope[templateName] = this.storage.getTemplate(templateName);
				}
			}
		});

		return scope;
	}


	private compileFilters(appendTo: Buffer<string>): void
	{
		this.eachFilter((filterType, definition) => {
			let name = this.getFilterTemplateImportName(definition);

			appendTo.append('_t.addFilter("' + definition.name + '", _t.createInstance(' + name + '), ' + (definition.injectTemplate ? 'true' : 'false') + ');');
		});
	}


	private compileBranch(appendTo: Buffer<string>, nodes: Array<StringToken|ElementToken>, dynamic: boolean = true): void
	{
		let node;

		for (let i = 0; i < nodes.length; i++) {
			node = nodes[i];

			if (node.type === HTMLTokenType.T_STRING) {
				this.compileStringNode(appendTo, node, dynamic);

			} else if (node.type === HTMLTokenType.T_EXPRESSION) {
				this.compileExpressionNode(appendTo, node, dynamic);

			} else if (node.type === HTMLTokenType.T_ELEMENT) {
				if ((<ElementToken>node).name === 'content') {
					this.compileContent(appendTo, node);

				} else {
					this.compileElementNode(appendTo, <ElementToken>node, dynamic);
				}
			}
		}
	}


	private compileStringNode(appendTo: Buffer<string>, node: StringToken, dynamic: boolean = true): void
	{
		appendTo.append('_t.appendText(_n, "' + this.escape(node.value) + '"' + (dynamic ? ', _b' : '') + ');');
	}


	private compileExpressionNode(appendTo: Buffer<string>, node: StringToken, dynamic: boolean = true): void
	{
		appendTo.append([
			'_t.appendText(_n, "", ' + (dynamic ? '_b' : 'null') + ', function(_n) {',
				'\t_t.watchText(_n, function(_t) {' +
					'return ' + this.compileExpression(node.value) +
				'});',
			'});',
		]);
	}


	private analyzeElement(node: ElementToken): ElementDefinition
	{
		let data: ElementDefinition = {
			elementRef: false,
			init: [],
			directives: [],
		};

		let components = [];

		this.eachDirective((directive: any, definition: DirectiveDefinition) => {
			if (QuerySelector.match(definition.metadata.selector, node)) {
				let localName = '_d_' + (this.directivesCount++);
				let outputs = {};

				Helpers.each(definition.outputs, (propertyName: string, output: OutputMetadataDefinition) => {
					outputs[output.name ? output.name : propertyName] = propertyName;
				});

				data.elementRef = true;

				if (definition.type === DirectiveType.Component) {
					components.push(definition.name);

					data.component = {
						localName: localName,
						definition: definition,
						componentType: directive,
						outputs: outputs,
					};
				} else {
					data.directives.push({
						localName: localName,
						definition: definition,
						directiveType: directive,
						init: typeof directive.prototype.onInit === 'function',
						outputs: outputs,
					});
				}
			}
		});

		if (components.length > 1) {
			throw Errors.tooManyComponentsPerElement(node.name, components);
		}

		return data;
	}


	private compileElementNode(appendTo: Buffer<string>, node: ElementToken, appendBefore: boolean = false): void
	{
		let elementDefinition = this.analyzeElement(node);

		let findDirectiveOutput = (name: string): {property: string, directiveLocalName: string} => {
			if (typeof elementDefinition.component !== 'undefined' && typeof elementDefinition.component.outputs[name] !== 'undefined') {
				return {
					property: elementDefinition.component.outputs[name],
					directiveLocalName: elementDefinition.component.localName,
				};
			}

			for (let i = 0; i < elementDefinition.directives.length; i++) {
				if (typeof elementDefinition.directives[i].outputs[name] !== 'undefined') {
					return {
						property: elementDefinition.directives[i].outputs[name],
						directiveLocalName: elementDefinition.directives[i].localName,
					};
				}
			}

			return null;
		};

		let hasTemplateRef = false;

		let localDirectives: {[localName: string]: string} = {};
		let exports: {[name: string]: string} = {};

		let buffer = new Buffer<string>();
		let directiveEvents: {[directiveName: string]: Array<{event: string, call: string}>} = {};

		Helpers.each(node.attributes, (name: string, attribute: AttributeToken) => {
			let originalName = attribute.originalName;

			switch (attribute.type) {
				case HTMLAttributeType.NATIVE:
					buffer.append('_t.setAttribute(_n, "' + originalName + '", "' + attribute.value + '");');

					break;
				case HTMLAttributeType.EXPRESSION:
					buffer.append(
						'_t.watchAttribute(_n, "' + originalName + '", function(_t) {' +
							'return ' + this.compileExpression(attribute.value) +
						'});'
					);

					break;
				case HTMLAttributeType.PROPERTY:
					let property = originalName.split('.');

					if (!Dom.propertyAllowed(node.name, property[0])) {
						return;
					}

					buffer.append(
						'_t.watchProperty(_n, "' + originalName + '", function(_t) {' +
							'return ' + this.compileExpression(attribute.value) +
						'});'
					);

					break;
				case HTMLAttributeType.EXPORT:
					exports[attribute.name] = attribute.value;

					break;
				case HTMLAttributeType.EVENT:
					elementDefinition.elementRef = true;

					let directiveOutput = findDirectiveOutput(attribute.name);

					if (directiveOutput) {
						if (typeof directiveEvents[directiveOutput.directiveLocalName] === 'undefined') {
							directiveEvents[directiveOutput.directiveLocalName] = [];
						}

						directiveEvents[directiveOutput.directiveLocalName].push({
							event: directiveOutput.property,
							call: this.compileExpression(attribute.value),
						});
					} else {
						buffer.append(
							'_t.addEventListener(_er, "' + attribute.name + '", function($event, $this, _t) {' +
								(attribute.preventDefault ? '$event.preventDefault(); ' : '') +
								this.compileExpression(attribute.value) +
							'});'
						);
					}

					break;
			}
		});

		if (node.name === 'template') {
			elementDefinition.elementRef = true;
			hasTemplateRef = true;

			this.compileTemplate(buffer, node);
		}

		this.eachDirectiveRequest((directiveLocalName: string, definition: DirectiveDefinition, parent: ElementToken, request: ChildRequest) => {
			if (request.type === ChildRequestType.Event && request.selector.charAt(0) === '@') {
				return;
			}

			if (QuerySelector.match(request.selector, node, parent)) {
				elementDefinition.elementRef = true;

				if (request.type === ChildRequestType.Element) {
					buffer.append(directiveLocalName + '["' + request.property + '"] = _er;');

				} else if (request.type === ChildRequestType.Event) {
					buffer.append('_t.addEventListener(_er, "' + request.event + '", function(e, _er) {' + directiveLocalName + '["' + request.listener + '"](e, _er);});');
				}

				request.imported = true;
			}
		});

		if (elementDefinition.component) {
			let component = elementDefinition.component;
			let definition = component.definition;

			localDirectives[elementDefinition.component.localName] = definition.name;
			this.compileDirective(buffer, component.localName, definition, node, hasTemplateRef, component.componentType, typeof directiveEvents[component.localName] !== 'undefined' ? directiveEvents[component.localName] : []);
		}

		for (let i = 0; i < elementDefinition.directives.length; i++) {
			let directive = elementDefinition.directives[i];
			let definition = directive.definition;

			localDirectives[directive.localName] = definition.name;
			this.compileDirective(buffer, directive.localName, definition, node, hasTemplateRef, directive.directiveType, typeof directiveEvents[directive.localName] !== 'undefined' ? directiveEvents[directive.localName] : []);
		}

		this.compileExports(buffer, node, elementDefinition, exports);

		if (node.name !== 'template' && node.children.length) {
			this.compileBranch(buffer, node.children, node.name === 'template');
		}

		this.checkDirectiveRequests(buffer, Object.keys(localDirectives));

		for (let i = 0; i < elementDefinition.directives.length; i++) {
			if (elementDefinition.directives[i].init) {
				buffer.append('_t.run(function() {' + elementDefinition.directives[i].localName + '.onInit();});');
			}
		}

		if (elementDefinition.elementRef) {
			buffer.prepend('var _er = ElementRef.get(_n);');
		}

		buffer.map((item: string) => Strings.indent(item));

		appendTo.append('_t.appendElement(_n, "' + node.name + '"' + (appendBefore ? ', _b' : (!buffer.isEmpty() ? ', null' : '')) + (!buffer.isEmpty() ? ', function(_n) {' : ');'));

		appendTo.merge(buffer);

		if (!buffer.isEmpty()) {
			appendTo.append('});');
		}
	}


	private compileExports(appendTo: Buffer<string>, node: ElementToken, elementDefinition: ElementDefinition, exports: {[name: string]: string}): void
	{
		let realType, names;
		let directives = {};

		for (let i = 0; i < elementDefinition.directives.length; i++) {
			let directive = elementDefinition.directives[i];
			if (directive.definition.metadata.exportAs) {
				directives[directive.localName] = directive.definition.metadata.exportAs;
			}
		}

		if (elementDefinition.component && elementDefinition.component.definition.metadata.exportAs) {
			directives[elementDefinition.component.localName] = elementDefinition.component.definition.metadata.exportAs;
		}

		Helpers.each(exports, (name: string, type: string) => {
			realType = null;
			names = Object.keys(directives);

			if (type === '' && node.name !== 'template') {
				if (names.length > 1) {
					throw Errors.ambitiousExportingDirectives(node.name, name);

				} else if (names.length === 1) {
					realType = names[0];

				} else {
					realType = '_er';
					elementDefinition.elementRef = true;
				}
			} else if (type === '$this') {
				realType = '_er';
				elementDefinition.elementRef = true;

			} else if (type !== '') {
				for (let i = 0; i < names.length; i++) {
					if (directives[names[i]] === type) {
						realType = names[i];
						break;
					}
				}
			}

			if (node.name !== 'template' && realType === null) {
				throw Errors.unknownExportingDirective(node.name, type, name);
			}

			if (node.name === 'template') {
				if (realType === null) {
					appendTo.append('_tr.dynamicScope.addParameter("' + name + '", "' + type + '");');
				} else {
					appendTo.append('_tr.scope.addParameter("' + name + '", ' + realType + ');');
				}
			} else {
				appendTo.append('_r.scope.addParameter("' + name + '", ' + realType + ');');
			}
		});
	}


	private compileInputs(appendTo: Buffer<string>, node: ElementToken, definition: DirectiveDefinition, directiveLocalName: string): void
	{
		Helpers.each(definition.inputs, (name: string, input: InputMetadataDefinition) => {
			let attributeName = input.name === null ? name : input.name;
			let attribute = node.attributes[attributeName];

			if (typeof attribute === 'undefined') {
				if (input.required) {
					throw Errors.suitableInputNotFound(definition.name, name, node.name);
				}

				return;
			}

			switch (attribute.type) {
				case HTMLAttributeType.NATIVE:
					appendTo.append(directiveLocalName + '["' + name + '"] = "' + Strings.addSlashes(attribute.value) + '";');
					break;
				case HTMLAttributeType.PROPERTY:
				case HTMLAttributeType.EXPRESSION:
					appendTo.append(
						'_t' + (definition.type === DirectiveType.Component ? '.parent' : '') + '.watchInput(_t, ' + directiveLocalName + ', "' + name + '", function(_t) {' +
							'return ' + this.compileExpression(attribute.value) +
						'});'
					);
					break;
			}
		});
	}


	private compileTemplate(appendTo: Buffer<string>, node: ElementToken): void
	{
		let templateName = this.templates.length;

		appendTo.append('var _tr = _r._template_' + templateName + ' = new TemplateRef(_t, _er, function(_t, _n, _b) {');

		this.inTemplate = true;

		let buffer = new Buffer<string>();
		this.compileBranch(buffer, node.children, true);
		Strings.indent(buffer);

		this.inTemplate = false;

		appendTo.merge(buffer);
		appendTo.append('});');

		this.templates.push(node);
	}


	private compileDirective(appendTo: Buffer<string>, localName: string, definition: DirectiveDefinition, node: ElementToken, hasTemplateRef: boolean, directiveType: any, directiveEvents: Array<{event: string, call: string}> = []): void
	{
		let requestsStorage: ComponentCompiler = this;
		let componentCompiler: ComponentCompiler = null;
		let onBeforeRenderBuffer = appendTo;

		let isComponent = definition.type === DirectiveType.Component;

		// create instance of directive

		let name = this.getDirectiveTemplateImportName(definition);

		if (isComponent) {
			componentCompiler = new ComponentCompiler(this.container, this.storage, directiveType, this);

			let innerTemplateName = componentCompiler.getName();
			let controllerAs = definition.metadata.controllerAs ? definition.metadata.controllerAs : null;

			requestsStorage = componentCompiler;
			onBeforeRenderBuffer = new Buffer<string>();

			appendTo.append('var ' + localName + ' = (new ' + innerTemplateName + '(_t, ' + name + ', _er, _t.container, _r.extensions, {}' + (hasTemplateRef ? ', _tr' : (controllerAs ? ', null' : '')) + (controllerAs ? ', "' + controllerAs + '"' : '') + ')).main(function(_r, _t) {');

			localName = '_r.component';
		} else {
			appendTo.append('var ' + localName + ' = _t.attachDirective(' + name + ', _er' + (hasTemplateRef ? ', [{service: TemplateRef, options: {useFactory: function() {return _tr;}}}]' : '') + ');');
		}

		// prepare host elements

		Helpers.each(definition.elements, (property: string, el: HostElementMetadataDefinition) => {
			requestsStorage.storeElementDirectiveRequest(localName, definition, node, el.selector, property);
		});

		// process inputs

		this.compileInputs(onBeforeRenderBuffer, node, definition, localName);

		// process parent component

		if (definition.parentComponent) {
			if (definition.parentComponent.definition.type && definition.parentComponent.definition.type !== this.component) {
				throw Errors.invalidParentComponent(definition.name, definition.parentComponent.property, Functions.getName(definition.parentComponent.definition.type), this.getDefinition().name);
			}

			onBeforeRenderBuffer.append(localName + '.' + definition.parentComponent.property + ' = _r' + (isComponent ? '.parent' : '') + '.component;');
		}

		// process child directives

		Helpers.each(this.getDefinition().childDirectives, (property: string, child: ChildDirectiveDefinition) => {
			if (child.type === directiveType) {
				if (this.inTemplate) {
					throw Errors.childDirectiveInEmbeddedTemplate(this.getDefinition().name, property, Functions.getName(child.type));
				}

				onBeforeRenderBuffer.append('_r' + (isComponent ? '.parent' : '') + '.component.' + property + ' = ' + localName + ';');
				child.imported = true;
			}
		});

		// process children directives

		Helpers.each(this.getDefinition().childrenDirectives, (property: string, children: ChildrenDirectiveDefinition) => {
			if (children.type === directiveType) {
				onBeforeRenderBuffer.append('_c.' + property + '._add(' + localName + ');');
				onBeforeRenderBuffer.append('_t.onDestroy.push(function() {_c.' + property + '._remove(' + localName + ');});');
			}
		});

		// process host events

		Helpers.each(definition.events, (name: string, event: HostEventMetadataDefinition) => {
			if (typeof event.el !== 'string') {
				throw Errors.invalidEventListenerType(definition.name, name);
			}

			if (event.el === '@') {
				onBeforeRenderBuffer.append('_t.addEventListener(_er, "' + event.name + '", function(e, _er) {' + localName + '["' + name + '"](e, _er);});');

			} else {
				requestsStorage.storeEventDirectiveRequest(localName, definition, node, <string>event.el, name, event.name);
			}
		});

		// process component's outputs + events

		for (let i = 0; i < directiveEvents.length; i++) {
			onBeforeRenderBuffer.append(
				'_r' + (isComponent ? '.parent' : '') + '.addDirectiveEventListener(' + localName + ', "' + directiveEvents[i].event + '", function($value, $this, _t) {' +
					directiveEvents[i].call +
				'});'
			);
		}

		// finish

		if (isComponent) {
			Strings.indent(onBeforeRenderBuffer);
			appendTo.merge(onBeforeRenderBuffer);

			appendTo.append('}, function(_r, _t) {');

			if (typeof directiveType.prototype.onInit === 'function') {
				appendTo.append('\t_t.run(function() {_r.component.onInit();});');
			}

			appendTo.append('}, function(_r, _t) {');

			if (typeof directiveType.prototype.onDestroy === 'function') {
				appendTo.append('\t_t.run(function() {_r.component.onDestroy();});');
			}

			appendTo.append('}).component;');
		}

		if (componentCompiler) {
			componentCompiler.compile();
		}
	}


	private compileContent(appendTo: Buffer<string>, node: ElementToken): void
	{
		let selector = node.attributes['selector'].value;
		let template = this.findTemplate(selector);

		if (template === null) {
			throw Errors.templateNotFound(selector);
		}

		let imports = node.attributes['import'];
		let importsCode = '{}';
		if (typeof imports !== 'undefined') {
			importsCode = this.compileExpression(imports.value);
		}

		appendTo.append([
			'_t.appendComment(_n, "' + ComponentCompiler.PLACEHOLDER_COMMENT + '", null, function(_n) {',
				'\t_r._template_' + template + '.createEmbeddedTemplate(' + importsCode + ', _n);',
			'});',
		]);
	}


	private checkDirectiveRequests(appendTo: Buffer<string>, directiveLocalNames: Array<string>): void
	{
		this.eachDirectiveRequest((directiveLocalName: string, definition: DirectiveDefinition, parent: ElementToken, request: ChildRequest) => {
			if (request.type === ChildRequestType.Event && !request.imported && request.selector.charAt(0) === '@') {
				let hostElement = request.selector.substr(1);
				let element = this.findElementDirectiveRequest(directiveLocalName, hostElement);

				if (!element) {
					throw Errors.hostElementForHostEventNotFound(definition.name, request.listener, request.event, hostElement);
				}

				request.imported = true;
				appendTo.append('_t.addEventListener(' + directiveLocalName + '["' + element.property + '"], "' + request.event + '", function(e, _er) {' + directiveLocalName + '["' + request.listener + '"](e, _er);});');
			}

			if (!request.imported) {
				if (request.type === ChildRequestType.Event) {
					throw Errors.hostEventElementNotFound(definition.name, request.listener, request.event, request.selector);

				} else if (request.type === ChildRequestType.Element) {
					throw Errors.hostElementNotFound(definition.name, request.property, request.selector);
				}
			}
		}, directiveLocalNames);
	}


	private getDefinition(): DirectiveDefinition
	{
		if (!this.definition) {
			this.definition = DirectiveParser.parse(this.component);
		}

		return this.definition;
	}


	public storeElementDirectiveRequest(directiveLocalName: string, definition: DirectiveDefinition, parent: ElementToken, selector: string, property: string): void
	{
		if (typeof this.directiveRequests[directiveLocalName] === 'undefined') {
			this.directiveRequests[directiveLocalName] = {
				definition: definition,
				parent: parent,
				requests: [],
			};
		}

		this.directiveRequests[directiveLocalName].requests.push({
			type: ChildRequestType.Element,
			selector: selector,
			imported: false,
			property: property,
		});
	}


	public storeEventDirectiveRequest(directiveLocalName: string, definition: DirectiveDefinition, parent: ElementToken, selector: string, listener: string, event: string): void
	{
		if (typeof this.directiveRequests[directiveLocalName] === 'undefined') {
			this.directiveRequests[directiveLocalName] = {
				definition: definition,
				parent: parent,
				requests: [],
			};
		}

		this.directiveRequests[directiveLocalName].requests.push({
			type: ChildRequestType.Event,
			selector: selector,
			imported: false,
			listener: listener,
			event: event,
		});
	}


	private eachDirectiveRequest(iterator: (directiveLocalName: string, definition: DirectiveDefinition, parent: ElementToken, request: ChildRequest) => void, filterDirectives?: Array<string>): void
	{
		Helpers.each(this.directiveRequests, (currentDirective: string, data: ChildRequestDirective) => {
			if (filterDirectives && filterDirectives.indexOf(currentDirective) === -1) {
				return;
			}

			for (let i = 0; i < data.requests.length; i++) {
				iterator(currentDirective, data.definition, data.parent, data.requests[i]);
			}
		});
	}


	private findElementDirectiveRequest(directiveLocalName: string, elementProperty: string): ChildRequest
	{
		for (let currentDirective in this.directiveRequests) {
			if (this.directiveRequests.hasOwnProperty(currentDirective) && currentDirective === directiveLocalName) {
				let directive = this.directiveRequests[currentDirective];

				for (let i = 0; i < directive.requests.length; i++) {
					let request = directive.requests[i];

					if (request.type === ChildRequestType.Element && request.property === elementProperty) {
						return request;
					}
				}
			}
		}

		return null;
	}


	protected eachDirective(fn: (directive: any, definition: DirectiveDefinition) => void): void
	{
		if (this.directives === null) {
			let exists = (directive: any): boolean => {
				for (let i = 0; i < this.directives.length; i++) {
					if (this.directives[i].directive === directive) {
						return true;
					}
				}

				return false;
			};

			this.directives = [];

			if (this.parent) {
				this.parent.eachDirective((directive: any, definition: DirectiveDefinition) => {
					if (!exists(directive)) {
						this.directives.push({
							directive: directive,
							definition: definition,
						});
					}
				});
			}

			Helpers.each(this.getDefinition().metadata.directives, (i: number, directive: any) => {
				if (!exists(directive)) {
					this.directives.push({
						directive: directive,
						definition: DirectiveParser.parse(directive),
					});
				}
			});
		}

		Helpers.each(this.directives, (i: number, item: {directive: any, definition: DirectiveDefinition}) => {
			fn(item.directive, item.definition);
		});
	}


	private eachFilter(fn: (filterType: any, definition: FilterMetadataDefinition) => void): void
	{
		let filters = this.getDefinition().metadata.filters;

		for (let i = 0; i < filters.length; i++) {
			let filter = filters[i];
			let metadata: FilterMetadataDefinition = Annotations.getAnnotation(filter, FilterMetadataDefinition);

			if (!metadata) {
				throw Errors.invalidFilter(Functions.getName(filter));
			}

			fn(filter, metadata);
		}
	}


	private findTemplate(selector: string): number
	{
		for (let i = 0; i < this.templates.length; i++) {
			if (QuerySelector.match(selector, this.templates[i])) {
				return i;
			}
		}

		return null;
	}


	private escape(str: string): string
	{
		return str.replace(/\n/g, '\\n');
	}


	private getDirectiveHash(definition: DirectiveDefinition): number
	{
		let parts = [
			definition.name,
			definition.metadata.selector
		];

		if (definition.metadata.controllerAs) {
			parts.push(definition.metadata.controllerAs);
		}

		if (definition.metadata.exportAs) {
			parts.push(definition.metadata.exportAs);
		}

		if (definition.metadata.template) {
			parts.push(definition.metadata.template.length + '');
		}

		return Strings.hash(parts.join('-'));
	}


	private getCompilerTemplateName(definition: DirectiveDefinition): string
	{
		return 'Template_' + definition.name + '_' + this.getDirectiveHash(definition);
	}


	private getDirectiveTemplateImportName(definition: DirectiveDefinition): string
	{
		return 'Directive_' + definition.name + '_' + this.getDirectiveHash(definition);
	}


	private getFilterTemplateImportName(definition: FilterMetadataDefinition): string
	{
		return 'Filter_' + Strings.hash(definition.name);
	}

}
