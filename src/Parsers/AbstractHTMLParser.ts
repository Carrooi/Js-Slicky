import {TextParser} from './TextParser';
import {Strings} from '../Util/Strings';


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


export abstract class AbstractHTMLParser
{


	private static TWO_WAY_BINDING_CHANGE = 'change';


	protected exports: Array<string> = [];


	protected parseAttribute(name: string, value: string): Array<AttributeToken>
	{
		let type = HTMLAttributeType.NATIVE;
		let preventDefault = false;
		let match;

		if (match = name.match(/^\[\((.+)\)]$/)) {
			return [
				this.parseAttribute('[' + match[1] + ']', value)[0],
				this.parseAttribute('(' + match[1] + '-' + AbstractHTMLParser.TWO_WAY_BINDING_CHANGE + ')!', value + '=$value')[0],
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


	protected parseAttributeValue(value: string): {type: HTMLAttributeType, value: string}
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
