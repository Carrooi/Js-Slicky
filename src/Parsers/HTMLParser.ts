import * as parse5 from 'parse5';
import {TextParser} from '../Parsers/TextParser';
import {TemplateAttributeParser} from '../Parsers/TemplateAttributeParser';
import {Helpers} from '../Util/Helpers';
import {AbstractHTMLParser, HTMLAttributeType, HTMLTokenType, AttributeToken, StringToken, ElementToken} from './AbstractHTMLParser';


export class HTMLParser extends AbstractHTMLParser
{


	public parse(html: string): {exports: Array<string>, tree: Array<StringToken|ElementToken>}
	{
		return {
			exports: this.exports,
			tree: this.parseDocument(<parse5.AST.Default.DocumentFragment>parse5.parseFragment(html)),
		};
	}


	private parseDocument(document: parse5.AST.Default.DocumentFragment): Array<StringToken|ElementToken>
	{
		return this.parseBranch(document.childNodes);
	}


	private parseChildren(element: parse5.AST.Default.Element, parent: ElementToken = null): Array<StringToken|ElementToken>
	{
		if (element.nodeName.toLowerCase() === 'template') {
			return this.parseDocument(element['content']);
		}

		return this.parseBranch(element.childNodes, parent);
	}


	private parseBranch(children: Array<parse5.AST.Default.Node>, parent: ElementToken = null): Array<StringToken|ElementToken>
	{
		let branch = [];
		let child: parse5.AST.Default.Node;

		for (let i = 0; i < children.length; i++) {
			child = children[i];

			if (child.nodeName === '#comment') {
				continue;
			}

			if (child.nodeName === '#text') {
				let items = this.parseText(<parse5.AST.Default.TextNode>child, parent);
				for (let j = 0; j < items.length; j++) {
					branch.push(items[j]);
				}

			} else {
				branch.push(this.parseElement(<parse5.AST.Default.Element>child, parent));
			}
		}

		return branch;
	}


	private parseText(node: parse5.AST.Default.TextNode, parent: ElementToken = null): Array<StringToken>
	{
		let tokens = TextParser.parse(node.value);

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
					value: node.value,
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


	private parseElement(element: parse5.AST.Default.Element, parent: ElementToken = null): ElementToken
	{
		let attributes = this.parseAttributes(element);

		let nodeToken: ElementToken = {
			type: HTMLTokenType.T_ELEMENT,
			name: element.nodeName.toLowerCase(),
			attributes: {},
			parent: !parent || parent.name === 'template' ? null : parent,
			children: [],
		};

		nodeToken.children = this.parseChildren(element, nodeToken);

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


	private parseAttributes(element: parse5.AST.Default.Element): {[name: string]: AttributeToken}
	{
		let attributes = {};

		for (let i = 0; i < element.attrs.length; i++) {
			let append = this.parseAttribute(element.attrs[i].name, element.attrs[i].value);
			for (let j = 0; j < append.length; j++) {
				attributes[append[j].name] = append[j];
			}
		}

		return attributes;
	}

}
