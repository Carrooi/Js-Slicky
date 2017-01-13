import {TextParser} from '../Parsers/TextParser';
import {TemplateAttributeParser} from '../Parsers/TemplateAttributeParser';
import {Helpers} from '../Util/Helpers';
import {AbstractHTMLParser, HTMLAttributeType, HTMLTokenType, AttributeToken, StringToken, ElementToken} from './AbstractHTMLParser';


export class HTMLParser extends AbstractHTMLParser
{


	public parse(html: string): {exports: Array<string>, tree: Array<StringToken|ElementToken>}
	{
		let parent = document.createElement('div');
		parent.innerHTML = html;

		return {
			exports: this.exports,
			tree: this.parseBranch(parent),
		};
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
				branch.push(this.parseElement(<Element>child, parent));

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


	private parseElement(node: Element, parent: ElementToken = null): ElementToken
	{
		let attributes = this.parseAttributes(node);

		let nodeToken: ElementToken = {
			type: HTMLTokenType.T_ELEMENT,
			name: node.nodeName.toLowerCase(),
			attributes: {},
			parent: !parent || parent.name === 'template' ? null : parent,
			children: [],
		};

		nodeToken.children = this.parseBranch(node, nodeToken);

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


	private parseAttributes(node: Element): {[name: string]: AttributeToken}
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

}
