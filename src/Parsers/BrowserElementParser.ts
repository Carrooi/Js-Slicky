import {AbstractHTMLParser, ElementToken, AttributeToken, HTMLTokenType, HTMLAttributeType} from './AbstractHTMLParser';


export class BrowserElementParser extends AbstractHTMLParser
{


	public parse(element: Element): ElementToken
	{
		if (element.nodeName.toLowerCase() === 'template') {
			throw new Error('BrowserElementParser: can not parse template element.');
		}

		return {
			type: HTMLTokenType.T_ELEMENT,
			name: element.nodeName.toLowerCase(),
			attributes: this.parseAttributes(element),
			parent: null,
			children: [],
		};
	}


	private parseAttributes(element: Element): {[name: string]: AttributeToken}
	{
		let attributes = {};

		for (let i = 0; i < element.attributes.length; i++) {
			let append = this.parseAttribute(element.attributes[i].name, element.attributes[i].value);
			for (let j = 0; j < append.length; j++) {
				if (append[j].type === HTMLAttributeType.TEMPLATE) {
					throw new Error('BrowserElementParser: can not parse template shortcut attribute "' + append[j].name + '".');
				}

				attributes[append[j].name] = append[j];
			}
		}

		return <any>attributes;
	}

}
