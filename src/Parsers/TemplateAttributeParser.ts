import {Strings} from '../Util/Strings';
import {Parser} from '../Tokenizer/Parser';
import {TokenType} from '../Tokenizer/Tokens';


export class TemplateAttributeParser
{


	public static parse(name: string, value: string): Array<{name: string, value: string}>
	{
		if (!name.match(/^\*/)) {
			throw new Error('Attribute ' + name + ' can not be transformed into template.');
		}

		name = Strings.hyphensToCamelCase(name.substr(1));

		let attributes = [];

		let parser = new Parser(value);
		let token, peek;
		let inParenthesis = 0;

		let current = {
			name: '',
			value: [],
		};

		let addCurrent = () => {
			attributes.push({
				name: '[' + name + Strings.firstUpper(current.name) + ']',
				value: current.value.join('').trim(),
			});

			current.name = null;
			current.value = [];
		};

		while (token = parser.token) {
			parser.resetPeek();
			peek = parser.peek();

			if (token.value === '#' && peek && peek.type === TokenType.T_NAME) {
				let exportName = peek.value;
				let exportValue = '';
				let move = 1;
				
				if (current.name !== null) {
					addCurrent();
				}
				
				peek = parser.peekSkip(TokenType.T_WHITESPACE);
				if (peek && peek.type === TokenType.T_CHARACTER && peek.value === '=') {
					peek = parser.peekSkip(TokenType.T_WHITESPACE);
					if (peek && peek.type === TokenType.T_NAME) {
						exportValue = peek.value;
						move = parser.peekPosition;
					}
				}

				attributes.push({
					name: '#' + exportName,
					value: exportValue,
				});

				parser.moveBy(move);
				parser.nextToken();

				continue;
			}

			if (token.type === TokenType.T_OPEN_PARENTHESIS) {
				inParenthesis++;
			} else if (token.type === TokenType.T_CLOSE_PARENTHESIS) {
				inParenthesis--;
			}

			if (token.type === TokenType.T_CHARACTER && token.value === ';' && current.name !== null && !inParenthesis) {
				addCurrent();
				parser.nextToken();
				continue;
			}

			if (current.name !== null) {
				current.value.push(token.value);
			}

			if (current.name === null && (token.type === TokenType.T_KEYWORD || token.type === TokenType.T_NAME)) {
				current.name = token.value;
			}

			parser.nextToken();
		}

		if (current.name !== null) {
			addCurrent();
		}

		return attributes;
	}


	public static toElementString(attributes: Array<{name: string, value: string}>): string
	{
		let code = [];

		for (let j = 0; j < attributes.length; j++) {
			code.push(Strings.camelCaseToHyphens(attributes[j].name) + '="' + attributes[j].value + '"');
		}

		return code.join(' ');
	}

}
