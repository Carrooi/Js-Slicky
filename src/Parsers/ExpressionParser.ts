import {Parser} from '../Tokenizer/Parser';
import {TokensIterator} from '../Tokenizer/TokensIterator';
import {Token} from '../Tokenizer/Tokenizer';
import {TokenType} from '../Tokenizer/Tokens';
import {Expression, ExpressionDependency, ExpressionFilter} from '../Interfaces';


export declare interface ExpressionParserOptions
{
	replaceGlobalRoot?: string,
	filterProvider?: string,
}


export class ExpressionParser
{


	public static parse(code: string, options: ExpressionParserOptions = {}): Expression
	{
		return ExpressionParser.parseGroup(new Parser(code), options, true);
	}


	private static parseGroup(parser: TokensIterator, options: ExpressionParserOptions, allowFilters: boolean = false, exitToken?: string): Expression
	{
		let parts = ExpressionParser.split(parser.tokens, '|');
		parser.tokens = parts.shift();

		let token: Token;
		let previousToken: Token;
		let position = 0;

		let currentDependency: ExpressionDependency = null;
		let currentExpression: Expression = {
			code: '',
			dependencies: [],
		};

		let next = () => {
			previousToken = parser.token;
			position++;
			parser.nextToken();
		};

		while (token = parser.token) {
			parser.resetPeek();

			let isDependency = false;
			let isObjectKey = false;
			let peek: Token = null;
			let value = token.value;

			if (token.type === TokenType.T_NAME) {
				if (
					((peek = parser.peek()) && peek.type === TokenType.T_CHARACTER && peek.value === ':') ||
					(
						(peek && peek.type === TokenType.T_WHITESPACE) &&
						((peek = parser.peek()) && peek.type === TokenType.T_CHARACTER && peek.value === ':')
					)
				) {
					isObjectKey = true;
				}
			}

			if (token.type === TokenType.T_NAME && !isObjectKey && !currentDependency) {
				isDependency = true;
				currentDependency = {
					code: '',
					root: token.value,
				};

				if (options.replaceGlobalRoot && token.value.charAt(0) !== '$') {
					value = options.replaceGlobalRoot.replace('%root', value);
				}

			} else if (
				currentDependency && previousToken &&
				(
					(token.type === TokenType.T_NAME && previousToken.type === TokenType.T_DOT) ||
					(
						token.type === TokenType.T_DOT &&
						[TokenType.T_NAME, TokenType.T_CLOSE_PARENTHESIS, TokenType.T_CLOSE_SQUARE_BRACKET].indexOf(previousToken.type) > -1
					)
				)
			) {
				isDependency = true;
			}

			if (currentDependency && previousToken && position) {
				let exitInnerExpressionWith = null;

				if (
					token.type === TokenType.T_OPEN_PARENTHESIS &&
					([TokenType.T_NAME, TokenType.T_CLOSE_PARENTHESIS, TokenType.T_CLOSE_SQUARE_BRACKET].indexOf(previousToken.type) > -1)
				) {
					exitInnerExpressionWith = TokenType.T_CLOSE_PARENTHESIS;

				} else if (
					token.type === TokenType.T_OPEN_SQUARE_BRACKET &&
					([TokenType.T_NAME, TokenType.T_CLOSE_SQUARE_BRACKET, TokenType.T_CLOSE_PARENTHESIS].indexOf(previousToken.type) > -1)
				) {
					exitInnerExpressionWith = TokenType.T_CLOSE_SQUARE_BRACKET;
				}

				if (exitInnerExpressionWith !== null) {
					let innerExpression = ExpressionParser.parseGroup(parser, options, false, exitInnerExpressionWith);
					token = parser.token;
					currentDependency.code += innerExpression.code;
					currentExpression.code += innerExpression.code;
					ExpressionParser.addDependencies(currentExpression.dependencies, innerExpression.dependencies);

					next();
					continue;
				}
			}

			if (isDependency) {
				currentDependency.code += token.value;
			}

			if (!isDependency && currentDependency !== null) {
				ExpressionParser.addDependencies(currentExpression.dependencies, [currentDependency]);
				currentDependency = null;
			}

			currentExpression.code += value;

			if (token.type === exitToken) {
				break;
			}

			next();
		}

		if (currentDependency) {
			ExpressionParser.addDependencies(currentExpression.dependencies, [currentDependency]);
		}

		if (allowFilters && options.filterProvider) {
			for (let i = 0; i < parts.length; i++) {
				let filter = ExpressionParser.parseFilter(parts[i], options);

				ExpressionParser.addDependencies(currentExpression.dependencies, filter.dependencies);

				currentExpression.code = options.filterProvider
					.replace(/%value/g, currentExpression.code.trim())
					.replace(/%filter/g, filter.name)
					.replace(/%args/g, filter.arguments.join(', '));
			}
		}

		currentExpression.code = currentExpression.code.trim();

		return currentExpression;
	}


	private static parseFilter(tokens: Array<Token>, options: ExpressionParserOptions): ExpressionFilter
	{
		let parts = ExpressionParser.split(tokens, ':');
		let dependencies = [];

		tokens = parts.shift();

		let name = ExpressionParser.trim(tokens);
		if (name.length !== 1 || name[0].type !== TokenType.T_NAME) {
			throw new Error('Invalid name of filter');
		}

		let args = [];
		for (let i = 0; i < parts.length; i++) {
			let arg = ExpressionParser.parseGroup(new TokensIterator(parts[i]), options);

			ExpressionParser.addDependencies(dependencies, arg.dependencies);
			args.push(arg.code);
		}

		return {
			name: name[0].value.trim(),
			dependencies: dependencies,
			arguments: args,
		};
	}


	private static split(tokens: Array<Token>, delimiter: string): Array<Array<Token>>
	{
		let result: Array<Array<Token>> = [];
		let inGroup = 0;

		for (let i = 0, j = 0; i < tokens.length; i++) {
			let token = tokens[i];

			if (token.type === TokenType.T_OPEN_PARENTHESIS || token.type === TokenType.T_OPEN_SQUARE_BRACKET || token.type === TokenType.T_OPEN_BRACES) {
				inGroup++;

			} else if (token.type === TokenType.T_CLOSE_PARENTHESIS || token.type === TokenType.T_CLOSE_SQUARE_BRACKET || token.type === TokenType.T_CLOSE_BRACES) {
				inGroup--;
			}

			if (token.value === delimiter && !inGroup && (!tokens[i + 1] || tokens[i + 1].value !== delimiter) && (!tokens[i - 1] || tokens[i - 1].value !== delimiter)) {
				j++;
				continue;
			}

			if (typeof result[j] === 'undefined') {
				result[j] = [];
			}

			result[j].push(token);
		}

		return result;
	}


	private static trim(tokens: Array<Token>): Array<Token>
	{
		if (!tokens.length) {
			return [];
		}

		if (tokens[0].type === TokenType.T_WHITESPACE) {
			let i = 0;
			for (; i < tokens.length; i++) {
				if (tokens[i].type !== TokenType.T_WHITESPACE) {
					break;
				}
			}

			tokens = tokens.slice(i);
		}

		if (tokens[tokens.length - 1].type === TokenType.T_WHITESPACE) {
			let i = tokens.length - 1;
			for (; i >= 0; i--) {
				if (tokens[i].type !== TokenType.T_WHITESPACE) {
					break;
				}
			}

			tokens = tokens.slice(0, i + 1);
		}

		return tokens;
	}


	private static findDependency(dependencies: Array<ExpressionDependency>, code: string): ExpressionDependency
	{
		for (let i = 0; i < dependencies.length; i++) {
			if (dependencies[i].code === code) {
				return dependencies[i];
			}
		}

		return null;
	}


	private static addDependencies(dependencies: Array<ExpressionDependency>, append: Array<ExpressionDependency>): void
	{
		for (let i = 0; i < append.length; i++) {
			if (!ExpressionParser.findDependency(dependencies, append[i].code)) {
				dependencies.push(append[i]);
			}
		}
	}

}
