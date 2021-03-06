import {TextParser} from '../Parsers/TextParser';
import {Strings} from '../Util/Strings';
import {TemplateAttributeParser} from '../Parsers/TemplateAttributeParser';
import {Helpers} from '../Util/Helpers';


export enum HTMLAttributeType
{
	NATIVE,
	EXPRESSION,
	PROPERTY,
	EVENT,
	EXPORT,
	TEMPLATE,
}


export enum HTMLTokenType
{
	T_ELEMENT,
	T_STRING,
	T_EXPRESSION,
	T_COMMENT,
}


export declare interface AttributeToken
{
	type: HTMLAttributeType,
	name: string,
	originalName: string,
	value: string,
	preventDefault?: boolean,
}


export declare interface StringToken
{
	type: HTMLTokenType,
	value: string,
	parent: ElementToken,
}


export declare interface ElementToken
{
	type: HTMLTokenType,
	name: string,
	attributes: {[name: string]: AttributeToken},
	parent: ElementToken,
	children: Array<StringToken|ElementToken>,
}


export class HTMLParser
{


	private static TWO_WAY_BINDING_CHANGE = 'change';


	private exports: Array<string> = [];


	public parse(html: string): {exports: Array<string>, tree: Array<StringToken|ElementToken>}
	{
		let parent = document.createElement('div');
		parent.innerHTML = html;

		return {
			exports: this.exports,
			tree: this.parseBranch(parent),
		};
	}


	public parseElement(element: Element): ElementToken
	{
		return this._parseElement(element, null, false);
	}


	private parseBranch(node: Node, parent: ElementToken = null): Array<StringToken|ElementToken>
	{
		let branch = [];
		let child: Node;

		if (node.nodeName.toLowerCase() === 'template' && typeof node['content'] !== 'undefined') {
			node = document.importNode(node, true)['content'];
		}

		for (let i = 0; i < node.childNodes.length; i++) {
			child = node.childNodes[i];

			if (child.nodeType === Node.TEXT_NODE) {
				let items = this.parseText(<Text>child, parent);
				for (let i = 0; i < items.length; i++) {
					branch.push(items[i]);
				}

			} else if (child.nodeType === Node.ELEMENT_NODE) {
				branch.push(this._parseElement(<Element>child, parent));

			}
		}

		return branch;
	}


	private parseText(node: Text, parent: ElementToken = null): Array<StringToken>
	{
		let tokens = TextParser.parse(node.nodeValue);

		if (tokens.length === 0) {
			// skip

		} else if (tokens.length === 1) {
			if (tokens[0].type === TextParser.TYPE_BINDING) {
				return [{
					type: HTMLTokenType.T_EXPRESSION,
					value: tokens[0].value,
					parent: parent,
				}];

			} else {
				return [{
					type: HTMLTokenType.T_STRING,
					value: node.nodeValue,
					parent: parent,
				}];
			}

		} else {
			let buffer: Array<StringToken> = [];

			for (let i = 0; i < tokens.length; i++) {
				let token = tokens[i];

				if (token.type === TextParser.TYPE_BINDING) {
					buffer.push({
						type: HTMLTokenType.T_EXPRESSION,
						value: token.value,
						parent: parent,
					});

				} else {
					buffer.push({
						type: HTMLTokenType.T_STRING,
						value: token.value,
						parent: parent,
					});
				}
			}

			return buffer;
		}
	}


	private _parseElement(node: Element, parent: ElementToken = null, parseChildren: boolean = true): ElementToken
	{
		let attributes = this.parseAttributes(node);

		let nodeToken: ElementToken = {
			type: HTMLTokenType.T_ELEMENT,
			name: node.nodeName.toLowerCase(),
			attributes: {},
			parent: !parent || parent.name === 'template' ? null : parent,
			children: [],
		};

		if (parseChildren) {
			nodeToken.children = this.parseBranch(node, nodeToken);
		}

		let rootTemplate: ElementToken;
		let parentTemplate: ElementToken;

		Helpers.each(attributes, (name: string, attribute: AttributeToken) => {
			if (attribute.type !== HTMLAttributeType.TEMPLATE) {
				nodeToken.attributes[attribute.name] = attribute;
				return;
			}

			let template: ElementToken = {
				type: HTMLTokenType.T_ELEMENT,
				name: 'template',
				attributes: {},
				parent: null,
				children: [],
			};

			let templateAttributes = TemplateAttributeParser.parse('*' + attribute.name, attribute.value);
			for (let i = 0; i < templateAttributes.length; i++) {
				let appendTemplateAttributes = this.parseAttribute(templateAttributes[i].name, templateAttributes[i].value);
				for (let j = 0; j < appendTemplateAttributes.length; j++) {
					template.attributes[appendTemplateAttributes[j].name] = appendTemplateAttributes[j];
				}
			}

			if (parentTemplate) {
				parentTemplate.children.push(template);
			} else {
				rootTemplate = template;
			}

			parentTemplate = template;
		});

		if (rootTemplate) {
			parentTemplate.children.push(nodeToken);
			nodeToken = rootTemplate;
		}

		return nodeToken;
	}


	public parseAttributes(node: Element): {[name: string]: AttributeToken}
	{
		let attributes = {};

		for (let i = 0; i < node.attributes.length; i++) {
			let append = this.parseAttribute(node.attributes[i].name, node.attributes[i].value);
			for (let j = 0; j < append.length; j++) {
				attributes[append[j].name] = append[j];
			}
		}

		return <any>attributes;
	}


	private parseAttribute(name: string, value: string): Array<AttributeToken>
	{
		let type = HTMLAttributeType.NATIVE;
		let preventDefault = false;
		let match;

		if (match = name.match(/^\[\((.+)\)]$/)) {
			return [
				this.parseAttribute('[' + match[1] + ']', value)[0],
				this.parseAttribute('(' + match[1] + '-' + HTMLParser.TWO_WAY_BINDING_CHANGE + ')!', value + '=$value')[0],
			];
		}

		if (match = name.match(/^\*(.+)/)) {
			type = HTMLAttributeType.TEMPLATE;
			name = match[1];
		} else if (match = name.match(/^#(.+)/)) {
			type = HTMLAttributeType.EXPORT;
			name = match[1];
		} else if (match = name.match(/^\[(.+)]$/)) {
			type = HTMLAttributeType.PROPERTY;
			name = match[1];
		} else if (match = name.match(/^\((.+)\)!?$/)) {
			preventDefault = name.slice(-1) === '!';
			type = HTMLAttributeType.EVENT;
			name = match[1];
		}

		if (type === HTMLAttributeType.NATIVE) {
			let attr = this.parseAttributeValue(value);
			type = attr.type;
			value = attr.value;
		}

		let attributes = [];

		if (type === HTMLAttributeType.EVENT) {
			let events = name.split('|');
			for (let i = 0; i < events.length; i++) {
				attributes.push({
					type: type,
					name: Strings.hyphensToCamelCase(events[i]),
					originalName: events[i],
					value: value,
					preventDefault: preventDefault,
				});
			}

		} else {
			let attribute: AttributeToken = {
				type: type,
				name: Strings.hyphensToCamelCase(name),
				originalName: name,
				value: value,
			};

			attributes.push(attribute);

			if (attribute.type === HTMLAttributeType.EXPORT && this.exports.indexOf(attribute.name) < 0) {
				this.exports.push(attribute.name);
			}
		}

		return attributes;
	}


	private parseAttributeValue(value: string): {type: HTMLAttributeType, value: string}
	{
		let tokens = TextParser.parse(value);
		let type = HTMLAttributeType.NATIVE;

		if (tokens.length === 0) {
			// skip

		} else if (tokens.length === 1) {
			if (tokens[0].type === TextParser.TYPE_BINDING) {
				type = HTMLAttributeType.EXPRESSION;
				value = tokens[0].value;
			}

		} else {
			let buffer = [];

			for (let i = 0; i < tokens.length; i++) {
				let token = tokens[i];

				if (token.type === TextParser.TYPE_TEXT) {
					buffer.push('"' + token.value + '"');

				} else if (token.type === TextParser.TYPE_BINDING) {
					buffer.push('(' + token.value + ')');
				}
			}

			type = HTMLAttributeType.EXPRESSION;
			value = buffer.join('+');
		}

		return {
			type: type,
			value: value,
		};
	}

}
