import {TokensIterator} from '../Tokenizer/TokensIterator';
import {Tokenizer, Token} from '../Tokenizer/Tokenizer';
import {TokenType} from '../Tokenizer/Tokens';


enum SelectorToken
{
	T_STRING,
	T_ENCAPSED_STRING,
	T_WHITESPACE,
	T_DOT,
	T_EQUAL,
	T_HASH,
	T_GREATER_THAT,
	T_SQUARE_BRACKET_OPEN,
	T_SQUARE_BRACKET_CLOSE,
}


export enum SelectorType
{
	Element,
	Id,
	Class,
	Attribute,
}


export enum ChildType
{
	Direct,
	Indirect,
}


export declare interface SelectorItem
{
	type: SelectorType,
	value: string|{name: string, value: string},
}


export declare interface ElementSelector
{
	childType: ChildType,
	selectors: Array<SelectorItem>,
}


export class SelectorParser
{


	public static parse(selector: string): Array<ElementSelector>
	{
		let iterator = SelectorParser.getIterator(selector);
		let token: Token;

		let result: Array<ElementSelector> = [];
		let current: ElementSelector;
		let attribute: {name: string, value: string};
		let childType: ChildType = ChildType.Indirect;

		while (token = iterator.token) {
			if (!current) {
				current = {
					childType: childType,
					selectors: [],
				};

				childType = ChildType.Indirect;
			}

			if (token.type === SelectorToken.T_SQUARE_BRACKET_OPEN) {
				token = iterator.nextToken();

				if (token.type !== SelectorToken.T_STRING) {
					throw new Error('Invalid selector "' + selector + '", string was expected after "[".');
				}

				attribute = {
					name: token.value,
					value: null,
				};

				token = iterator.nextToken();

				if (token.type === SelectorToken.T_EQUAL) {
					token = iterator.nextToken();

					if (token.type !== SelectorToken.T_ENCAPSED_STRING) {
						throw new Error('Invalid selector "' + selector + '", encapsed string was expected after "=".');
					}

					attribute.value = token.value.substr(1, token.value.length - 2);

					token = iterator.nextToken();

					if (token.type !== SelectorToken.T_SQUARE_BRACKET_CLOSE) {
						throw new Error('Invalid selector "' + selector + '", closing square bracket was expected after "' + attribute.value + '".');
					}

				} else if (token.type !== SelectorToken.T_SQUARE_BRACKET_CLOSE) {
					throw new Error('Invalid selector "' + selector + '", closing square bracket or "=" was expected after "' + attribute.name + '".');
				}

				current.selectors.push({
					type: SelectorType.Attribute,
					value: attribute,
				});

			} else if (token.type === SelectorToken.T_HASH) {
				if ((token = iterator.nextToken()).type !== SelectorToken.T_STRING) {
					throw new Error('Invalid selector "' + selector + '", string was expected after "#".');
				}

				current.selectors.push({
					type: SelectorType.Id,
					value: token.value,
				});

			} else if (token.type === SelectorToken.T_DOT) {
				if ((token = iterator.nextToken()).type !== SelectorToken.T_STRING) {
					throw new Error('Invalid selector "' + selector + '", string was expected after ".".');
				}

				current.selectors.push({
					type: SelectorType.Class,
					value: token.value,
				});

			} else if (token.type === SelectorToken.T_GREATER_THAT) {
				childType = ChildType.Direct;

				if (current) {
					result.push(current);
					current = null;
				}

			} else if (token.type === SelectorToken.T_STRING) {
				current.selectors.push({
					type: SelectorType.Element,
					value: token.value,
				});

			} else if (token.type === SelectorToken.T_WHITESPACE && current) {
				result.push(current);
				current = null;

			} else if (token.type === TokenType.T_UNKNOWN) {
				throw new Error('Invalid selector "' + selector + '", unknown token "' + token.value + '".');
			}

			iterator.nextToken();
		}

		if (current) {
			result.push(current);
		}

		return result;
	}


	private static getIterator(selector: string): TokensIterator
	{
		let t = new Tokenizer;

		t.addRule(SelectorToken.T_ENCAPSED_STRING, /(?:"(?:(?:\\\n|\\"|[^"\n]))*?")|(?:'(?:(?:\\\n|\\'|[^'\n]))*?')/);
		t.addRule(SelectorToken.T_STRING, /[a-zA-Z_][a-zA-Z0-9_\-:]*/);

		t.addRule(SelectorToken.T_DOT, /\./);
		t.addRule(SelectorToken.T_EQUAL, /=/);
		t.addRule(SelectorToken.T_HASH, /#/);
		t.addRule(SelectorToken.T_GREATER_THAT, /\s*>\s*/);

		t.addRule(SelectorToken.T_SQUARE_BRACKET_OPEN, /\[/);
		t.addRule(SelectorToken.T_SQUARE_BRACKET_CLOSE, /]/);

		t.addRule(SelectorToken.T_WHITESPACE, /\s+/);

		return new TokensIterator(t.tokenize(selector));
	}

}
