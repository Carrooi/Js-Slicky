import {Strings} from '../../Util/Strings';
import {DirectiveDefinition, DirectiveParser, DirectiveType} from '../../Entity/DirectiveParser';
import {ClassGenerator} from '../../Util/CodeGenerator/ClassGenerator';
import {Expression} from '../../Interfaces';
import {AbstractComponentTemplate} from '../Templates/AbstractComponentTemplate';
import {ElementRef} from '../ElementRef';
import {TemplateRef} from '../TemplateRef';
import {Helpers} from '../../Util/Helpers';
import {
	HostElementMetadataDefinition, InputMetadataDefinition,
	HostEventMetadataDefinition
} from '../../Entity/Metadata';
import {Annotations} from '../../Util/Annotations';
import {
	HTMLParser, StringToken, ExpressionToken, ElementToken, HTMLTokenType, HTMLAttributeType,
	AttributeToken
} from '../../Parsers/HTMLParser';
import {QuerySelector} from '../QuerySelector';
import {Container} from '../../DI/Container';
import {Dom} from '../../Util/Dom';
import {FilterMetadataDefinition} from '../Filters/Metadata';
import {Functions} from '../../Util/Functions';
import {Buffer} from '../../Util/Buffer';
import {AbstractCompiler} from "./AbstractCompiler";


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


/**
 * Compiles template class for given component
 *
 * Local variables:
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


	private templatesCount: number = 0;

	private directivesCount: number = 0;

	private container: Container;

	private parent: ComponentCompiler;

	private name: string = null;

	private component: any;

	private template: ClassGenerator;

	private definition: DirectiveDefinition;

	private directives: Array<{directive: any, definition: DirectiveDefinition}> = null;

	private directiveRequests: ChildRequests = {};

	private templateImports: {[localName: string]: any} = {};


	constructor(container: Container, component: any, parent?: ComponentCompiler)
	{
		super();

		this.container = container;
		this.component = component;

		if (parent) {
			this.parent = parent;
		}
	}


	public getName(): string
	{
		if (this.name === null) {
			this.name = 'Template_' + ComponentCompiler.createDirectiveHash(this.getDefinition());
		}

		return this.name;
	}


	public compile(node?: ElementToken): Function
	{
		this.template = new ClassGenerator(this.getName(), 'Template');

		let definition = this.getDefinition();
		let html = HTMLParser.parse(definition.metadata.template, {
			replaceGlobalRoot: '_t.scope.findParameter("%root")',
		});

		let main = this.template.addMethod('main', ['onReady'], [
			'var _r, _t = _r = this;',
			'var _n = this.elementRef.nativeElement;',
			'var _er = this.elementRef;',
			'var _tr = this.templateRef;',
			'_n.innerHTML = "";',
		]);

		let mainBody = main.getBody();

		if (definition.metadata.changeDetection !== null) {
			mainBody.append('_r.changeDetector.strategy = ' + definition.metadata.changeDetection + ';');
		}

		if (Object.keys(definition.metadata.translations)) {
			mainBody.append('_r.translations = ' + JSON.stringify(definition.metadata.translations) + ';');
		}

		this.compileFilters(mainBody);

		if (node) {
			this.compileDirective(mainBody, '_r.component', definition, node, false);
		}

		this.compileBranch(mainBody, html, false);
		this.checkDirectiveRequests(mainBody, ['_r.component']);

		mainBody.append('onReady(_r, _t);');
		mainBody.append('return _r;');

		console.log(this.template.toString());

		let scope = {
			Template: AbstractComponentTemplate,
			ElementRef: ElementRef,
			TemplateRef: TemplateRef,
		};

		Helpers.each(this.templateImports, (localName: string, value: any) => {
			scope[localName] = value;
		});

		return this.template.generate(scope);
	}


	private compileFilters(appendTo: Buffer<string>): void
	{
		let filters = this.getDefinition().metadata.filters;

		for (let i = 0; i < filters.length; i++) {
			let filter = filters[i];
			let metadata: FilterMetadataDefinition = Annotations.getAnnotation(filter, FilterMetadataDefinition);

			if (!metadata) {
				throw new Error('Filter ' + Functions.getName(filter) + ' is not valid filter, please add @Filter annotation.');
			}

			let name = 'Filter_' + Strings.hash(metadata.name);
			this.templateImports[name] = filter;

			appendTo.append('_t.addFilter("' + metadata.name + '", _t.createInstance(' + name + '), ' + (metadata.injectTemplate ? 'true' : 'false') + ');');
		}
	}


	private compileBranch(appendTo: Buffer<string>, nodes: Array<StringToken|ElementToken>, dynamic: boolean = true): void
	{
		let node;

		for (let i = 0; i < nodes.length; i++) {
			node = nodes[i];

			if (node.type === HTMLTokenType.T_STRING) {
				this.compileStringNode(appendTo, <StringToken>node, dynamic);

			} else if (node.type === HTMLTokenType.T_EXPRESSION) {
				this.compileExpressionNode(appendTo, <ExpressionToken>node, dynamic);

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
		appendTo.append('_t.appendText(_n, "' + node.value + '"' + (dynamic ? ', _b' : '') + ');');
	}


	private compileExpressionNode(appendTo: Buffer<string>, node: ExpressionToken, dynamic: boolean = true): void
	{
		appendTo.append([
			'_t.appendText(_n, "", ' + (dynamic ? '_b' : 'null') + ', function(_n) {',
				'\t_t.watchExpression(_n, ' + JSON.stringify(node.expression) + ');',
			'});',
		]);
	}


	private compileElementNode(appendTo: Buffer<string>, node: ElementToken, appendBefore: boolean = false): void
	{
		let includeElementRef = false;
		let hasTemplateRef = false;

		let localDirectives: {[localName: string]: string} = {};
		let exports: {[name: string]: string} = {};
		let callInit: Array<string> = [];

		let buffer = new Buffer<string>();
		let events;

		Helpers.each(node.attributes, (name: string, attribute: AttributeToken) => {
			switch (attribute.type) {
				case HTMLAttributeType.NATIVE:
					buffer.append('_n.setAttribute("' + attribute.name + '", "' + attribute.value + '");');

					break;
				case HTMLAttributeType.EXPRESSION:
					buffer.append('_t.watchAttribute(_n, "' + attribute.name + '", ' + JSON.stringify(attribute.value) + ');');

					break;
				case HTMLAttributeType.PROPERTY:
					if (!Dom.propertyAllowed(node.name, attribute.name)) {
						return;
					}

					buffer.append([
						'_n.setAttribute("' + attribute.name + '", "");',
						'_t.watchProperty(_n, "' + attribute.name + '", ' + JSON.stringify(attribute.value) + ');',
					]);

					break;
				case HTMLAttributeType.EXPORT:
					exports[attribute.name] = <string>attribute.value;

					break;
				case HTMLAttributeType.EVENT:
					events = attribute.name.split('|');
					includeElementRef = true;

					for (let j = 0; j < events.length; j++) {
						buffer.append('_t.addEventListener(_er, "' + events[j] + '", "' + this.fixCall((<Expression>attribute.value).code) + '");');
					}

					break;
			}
		});

		if (node.name === 'template') {
			includeElementRef = true;
			hasTemplateRef = true;

			this.compileTemplate(buffer, node);
		}

		this.eachDirectiveRequest((directiveLocalName: string, definition: DirectiveDefinition, parent: ElementToken, request: ChildRequest) => {
			if (request.type === ChildRequestType.Event && request.selector.charAt(0) === '@') {
				return;
			}

			if (QuerySelector.match(request.selector, node, parent)) {
				includeElementRef = true;

				if (request.type === ChildRequestType.Element) {
					buffer.append(directiveLocalName + '["' + request.property + '"] = _er;');

				} else if (request.type === ChildRequestType.Event) {
					buffer.append('_t.addEventListener(_er, "' + request.event + '", function(e, _er) {' + directiveLocalName + '["' + request.listener + '"](e, _er);});');
				}

				request.imported = true;
			}
		});

		this.eachDirective((directive: any, definition: DirectiveDefinition) => {
			if (QuerySelector.match(definition.metadata.selector, node)) {
				let localName = '_d_' + (this.directivesCount++);

				includeElementRef = true;
				localDirectives[localName] = definition.name;

				if (definition.type === DirectiveType.Directive && typeof directive.prototype.onInit === 'function') {
					callInit.push(localName);
				}

				this.compileDirective(buffer, localName, definition, node, hasTemplateRef, directive);
			}
		});

		this.compileExports(buffer, node, exports, localDirectives);

		if (node.name !== 'template' && node.children.length) {
			this.compileBranch(buffer, node.children, node.name === 'template');
		}

		this.checkDirectiveRequests(buffer, Object.keys(localDirectives));

		for (let i = 0; i < callInit.length; i++) {
			buffer.append('_t.run(function() {' + callInit[i] + '.onInit();});');
		}

		if (includeElementRef) {
			buffer.prepend('var _er = ElementRef.get(_n);');
		}

		buffer.map((item: string) => Strings.indent(item));

		appendTo.append('_t.appendElement(_n, "' + node.name + '"' + (appendBefore ? ', _b' : (!buffer.isEmpty() ? ', null' : '')) + (!buffer.isEmpty() ? ', function(_n) {' : ');'));

		appendTo.merge(buffer);

		if (!buffer.isEmpty()) {
			appendTo.append('});');
		}
	}


	private compileExports(appendTo: Buffer<string>, node: ElementToken, exports: {[name: string]: string}, directives: {[localName: string]: string}): void
	{
		let realType, names;

		Helpers.each(exports, (name: string, type: string) => {
			realType = null;
			names = Object.keys(directives);

			if (type === '' && node.name !== 'template') {
				if (names.length > 1) {
					throw new Error('Please, specify exporting type for "' + name + '". Element "' + node.name + '" has more than one attached directives.');

				} else if (names.length === 1) {
					realType = names[0];

				} else {
					realType = '_n';
				}
			} else if (type === '$this') {
				realType = '_n';

			} else if (type !== '') {
				for (let i = 0; i < names.length; i++) {
					if (directives[names[i]] === type) {
						realType = names[i];
						break;
					}
				}
			}

			if (node.name !== 'template' && realType === null) {
				throw new Error('Can not export directive "' + type + '" into "' + name + '" on element "' + node.name + '". Such directive does not exists there.');
			}

			if (node.name === 'template') {
				if (realType === null) {
					appendTo.append('_tr.dynamicScope.addParameter("' + name + '", "' + type + '");');
				} else {
					appendTo.append('_tr.scope.addParameter("' + name + '", ' + realType + ');');
				}
			} else {
				appendTo.append('_t.scope.addParameter("' + name + '", ' + realType + ');');
			}
		});
	}


	private compileInputs(appendTo: Buffer<string>, node: ElementToken, definition: DirectiveDefinition, directiveLocalName: string = '_d'): void
	{
		Helpers.each(definition.inputs, (name: string, input: InputMetadataDefinition) => {
			let attributeName = input.name === null ? name : input.name;
			let attribute = node.attributes[attributeName];

			if (typeof attribute === 'undefined') {
				if (input.required) {
					throw new Error(definition.name + '.' + name + ': could not find any suitable input in ' + node.name + ' element.');
				}

				return;
			}

			switch (attribute.type) {
				case HTMLAttributeType.NATIVE:
					appendTo.append(directiveLocalName + '["' + name + '"] = "' + Strings.addSlashes(<string>attribute.value) + '";');
					break;
				case HTMLAttributeType.PROPERTY:
				case HTMLAttributeType.EXPRESSION:
					appendTo.append('_t.watchInput(' + directiveLocalName + ', "' + name + '", ' + JSON.stringify(attribute.value) + ');');
					break;
			}
		});
	}


	private compileTemplate(appendTo: Buffer<string>, node: ElementToken): void
	{
		let templateIdAttribute = node.attributes['id'];
		let templateName = typeof templateIdAttribute !== 'undefined' ? templateIdAttribute.value : this.templatesCount++;

		let templateMethod = this.template.addMethod('template_' + templateName, ['_t', '_er'], [
			'var _r, _t = _r = this;',
			'return _er.getTemplateRef(function(_er) {',
				'\treturn new TemplateRef(_t, "' + templateName + '", _er, function(_t, _n, _b) {',
		]);

		let buffer = new Buffer<string>();

		this.compileBranch(buffer, node.children, node.name === 'template');

		Strings.indent(buffer, 2);

		templateMethod.getBody().merge(buffer);

		templateMethod.appendBody([
				'\t});',
			'});'
		]);

		appendTo.append([
			'var _tr = _r.template_' + templateName + '(_t, _er);',
			'_r.registerTemplate(_tr, "' + templateName + '");',
		]);
	}


	private compileDirective(appendTo: Buffer<string>, localName: string, definition: DirectiveDefinition, node: ElementToken, hasTemplateRef: boolean, directive?: any): void
	{
		let requestsStorage: ComponentCompiler = this;
		let componentCompiler: ComponentCompiler = null;
		let directiveAppendTo = appendTo;

		// create instance of directive

		if (directive) {
			let name = 'Directive_' + ComponentCompiler.createDirectiveHash(definition);
			this.templateImports[name] = directive;

			if (definition.type === DirectiveType.Component) {
				componentCompiler = new ComponentCompiler(this.container, directive, this);

				let innerTemplateName = componentCompiler.getName();
				let controllerAs = definition.metadata['controllerAs'] ? definition.metadata['controllerAs'] : null;

				requestsStorage = componentCompiler;
				directiveAppendTo = new Buffer<string>();

				appendTo.append('var ' + localName + ' = (new ' + innerTemplateName + '(_t, ' + name + ', _er, _t.container, {}' + (hasTemplateRef ? ', _tr' : (controllerAs ? ', null' : '')) + (controllerAs ? ', "' + controllerAs + '"' : '') + ')).main(function(_r, _t) {');

				localName = '_r.component';
			} else {
				appendTo.append('var ' + localName + ' = _t.attachDirective(' + name + ', _er' + (hasTemplateRef ? ', _tr' : '') + ');');
			}
		}

		// prepare host elements

		Helpers.each(definition.elements, (property: string, el: HostElementMetadataDefinition) => {
			requestsStorage.storeElementDirectiveRequest(localName, definition, node, el.selector, property);
		});

		// process inputs

		this.compileInputs(directiveAppendTo, node, definition, localName);

		// process host events

		Helpers.each(definition.events, (name: string, event: HostEventMetadataDefinition) => {
			if (typeof event.el !== 'string') {
				throw new Error('Only string event listeners are supported.');
			}

			if (event.el === '@') {
				directiveAppendTo.append('_t.addEventListener(_er, "' + event.name + '", function(e, _er) {' + localName + '["' + name + '"](e, _er);});');

			} else {
				requestsStorage.storeEventDirectiveRequest(localName, definition, node, <string>event.el, name, event.name);
			}
		});

		if (directiveAppendTo !== appendTo) {
			Strings.indent(directiveAppendTo);
			appendTo.merge(directiveAppendTo);

			if (typeof directive.prototype.onInit === 'function') {
				appendTo.append('\t_t.run(function() {_r.component.onInit();});');
			}

			appendTo.append('}).component;');
		}

		if (componentCompiler) {
			this.templateImports[componentCompiler.getName()] = componentCompiler.compile();
		}
	}


	private compileContent(appendTo: Buffer<string>, node: ElementToken): void
	{
		let selector = <string>node.attributes['selector'].value;

		if (!selector.match(/^#[a-zA-Z0-9-_]+$/)) {
			throw new Error('Can not include template by selector "' + selector + '", only id selector is supported for now.');
		}

		let imports = node.attributes['import'];
		let importsCode = '{}';
		if (typeof imports !== 'undefined') {
			importsCode = (<Expression>imports.value).code;
		}

		appendTo.append([
			'_t.appendComment(_n, "' + ComponentCompiler.PLACEHOLDER_COMMENT + '", null, function(_n) {',
				'\t_r.getTemplate("' + selector.substr(1) + '").createEmbeddedTemplate(' + importsCode + ', _n);',
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
					throw new Error(definition.name + ': could not bind "' + request.event + '" event to host element "' + hostElement + '". Host element does not exists.');
				}

				request.imported = true;
				appendTo.append('_t.addEventListener(' + directiveLocalName + '["' + element.property + '"], "' + request.event + '", function(e, _er) {' + directiveLocalName + '["' + request.listener + '"](e, _er);});');
			}

			if (!request.imported) {
				if (request.type === ChildRequestType.Event) {
					throw new Error(definition.name + ': could not bind "' + request.event + '" event to element "' + request.selector + '". Element does not exists.');

				} else if (request.type === ChildRequestType.Element) {
					throw new Error(definition.name + ': could not import host element "' + request.selector + '" into "' + request.property + '". Element does not exists.');
				}
			}
		}, directiveLocalNames);
	}


	private fixCall(code: string): string
	{
		if (typeof code !== 'string') {
			code = JSON.stringify(code);
		}

		return Strings.addSlashes(code);
	}


	private getDefinition(): DirectiveDefinition
	{
		if (!this.definition) {
			this.definition = DirectiveParser.parse(this.component);
		}

		return this.definition;
	}


	private storeElementDirectiveRequest(directiveLocalName: string, definition: DirectiveDefinition, parent: ElementToken, selector: string, property: string): void
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


	private storeEventDirectiveRequest(directiveLocalName: string, definition: DirectiveDefinition, parent: ElementToken, selector: string, listener: string, event: string): void
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
			this.directives = [];

			Helpers.each(this.getDefinition().metadata.directives, (i: number, directive: any) => {
				this.directives.push({
					directive: directive,
					definition: DirectiveParser.parse(directive),
				});
			});
		}

		Helpers.each(this.directives, (i: number, item: {directive: any, definition: DirectiveDefinition}) => {
			fn(item.directive, item.definition);
		});

		if (this.parent) {
			this.parent.eachDirective(fn);
		}
	}


	public static createDirectiveHash(component: DirectiveDefinition): number
	{
		return Strings.hash(component.name + '_' + component.metadata.selector);
	}

}