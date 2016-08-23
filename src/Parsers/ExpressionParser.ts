import {Parser} from '../Tokenizer/Parser';
import {TokensIterator} from '../Tokenizer/TokensIterator';
import {Token} from '../Tokenizer/Tokenizer';
import {Lexer} from '../Tokenizer/Lexer';
import {Compiler} from '../Compiler';
import {ExpressionCallType, ExpressionDependencyType} from '../constants';
import {Expression, ExpressionDependency, ExpressionDependency, ExpressionFilter} from '../Interfaces';


export class ExpressionParser
{


	public static parse(code: string): Expression
	{
		return ExpressionParser.parseGroup(new Parser(code), true);
	}


	private static parseGroup(parser: TokensIterator, allowFilters: boolean = false, exitToken?: string): Expression
	{
		let parts = ExpressionParser.split(parser.tokens, Compiler.FILTER_DELIMITER);
		parser.tokens = parts.shift();

		let token: Token;
		let previousToken: Token;
		let position = 0;

		let currentDependencyExportable = false;
		let currentDependency: ExpressionDependency = null;
		let currentExpression: Expression = {
			code: '',
			callType: ExpressionCallType.Static,
			dependencies: [],
			filters: [],
		};

		let next = () => {
			previousToken = parser.token;
			position++;
			parser.nextToken();
		};

		while (token = parser.token) {
			let isDependency = false;

			if (token.type === Lexer.T_UNKNOWN && token.value === '#') {
				let nextToken = parser.getNextToken();
				if (nextToken && nextToken.type === Lexer.T_NAME) {
					currentDependencyExportable = true;
					//currentExpression.code += 'var ';

					next();
					continue;
				}
			}

			if (token.type === Lexer.T_NAME && !currentDependency) {
				isDependency = true;
				currentDependency = {
					code: '',
					root: token.value,
					type: ExpressionDependencyType.Object,
					exportable: false,
				};

			} else if (
				currentDependency && previousToken &&
				(
					(token.type === Lexer.T_NAME && previousToken.type === Lexer.T_DOT) ||
					(
						token.type === Lexer.T_DOT &&
						[Lexer.T_NAME, Lexer.T_CLOSE_PARENTHESIS, Lexer.T_CLOSE_SQUARE_BRACKET].indexOf(previousToken.type) > -1
					)
				)
			) {
				isDependency = true;
			}

			if (currentDependency && previousToken && position) {
				let exitInnerExpressionWith = null;

				if (
					token.type === Lexer.T_OPEN_PARENTHESIS &&
					([Lexer.T_NAME, Lexer.T_CLOSE_PARENTHESIS, Lexer.T_CLOSE_SQUARE_BRACKET].indexOf(previousToken.type) > -1)
				) {
					currentDependency.type = ExpressionDependencyType.Call;
					exitInnerExpressionWith = Lexer.T_CLOSE_PARENTHESIS;

				} else if (
					token.type === Lexer.T_OPEN_SQUARE_BRACKET &&
					([Lexer.T_NAME, Lexer.T_CLOSE_SQUARE_BRACKET, Lexer.T_CLOSE_PARENTHESIS].indexOf(previousToken.type) > -1)
				) {
					exitInnerExpressionWith = Lexer.T_CLOSE_SQUARE_BRACKET;
				}

				if (exitInnerExpressionWith !== null) {
					let innerExpression = ExpressionParser.parseGroup(parser, false, exitInnerExpressionWith);
					token = parser.token;
					currentDependency.code += innerExpression.code;
					currentExpression.code += innerExpression.code;
					ExpressionParser.addDependencies(currentExpression, innerExpression.dependencies);

					next();
					continue;
				}
			}

			if (isDependency) {
				currentDependency.code += token.value;
			}

			if (!isDependency && currentDependency !== null) {
				if (currentDependencyExportable) {
					currentDependency.exportable = true;
				}

				ExpressionParser.addDependencies(currentExpression, [currentDependency]);
				currentDependency = null;
				currentDependencyExportable = false;
			}

			currentExpression.code += token.value;

			if (token.type === exitToken) {
				break;
			}

			next();
		}

		if (currentDependency) {
			ExpressionParser.addDependencies(currentExpression, [currentDependency]);
		}

		if (allowFilters) {
			for (let i = 0; i < parts.length; i++) {
				let filter = ExpressionParser.parseFilter(parts[i]);
				for (let j = 0; j < filter.arguments.length; j++) {
					ExpressionParser.addDependencies(currentExpression, filter.arguments[j].dependencies);
				}

				currentExpression.filters.push(filter);
			}
		}

		currentExpression.code = currentExpression.code.trim();

		return currentExpression;
	}


	private static parseFilter(tokens: Array<Token>): ExpressionFilter
	{
		let parts = ExpressionParser.split(tokens, Compiler.FILTER_ARGUMENT_DELIMITER);

		tokens = parts.shift();

		let name = ExpressionParser.trim(tokens);
		if (name.length !== 1 || name[0].type !== Lexer.T_NAME) {
			throw new Error('Invalid name of filter');
		}

		let args = [];
		for (let i = 0; i < parts.length; i++) {
			args.push(ExpressionParser.parseGroup(new TokensIterator(parts[i])));
		}

		return {
			name: name[0].value.trim(),
			arguments: args,
		};
	}


	private static split(tokens: Array<Token>, delimiter: string): Array<Array<Token>>
	{
		let result: Array<Array<Token>> = [];
		let inGroup = 0;

		for (let i = 0, j = 0; i < tokens.length; i++) {
			let token = tokens[i];

			if (token.type === Lexer.T_OPEN_PARENTHESIS || token.type === Lexer.T_OPEN_SQUARE_BRACKET || token.type === Lexer.T_OPEN_BRACES) {
				inGroup++;

			} else if (token.type === Lexer.T_CLOSE_PARENTHESIS || token.type === Lexer.T_CLOSE_SQUARE_BRACKET || token.type === Lexer.T_CLOSE_BRACES) {
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

		if (tokens[0].type === Lexer.T_WHITESPACE) {
			let i = 0;
			for (; i < tokens.length; i++) {
				if (tokens[i].type !== Lexer.T_WHITESPACE) {
					break;
				}
			}

			tokens = tokens.slice(i);
		}

		if (tokens[tokens.length - 1].type === Lexer.T_WHITESPACE) {
			let i = tokens.length - 1;
			for (; i >= 0; i--) {
				if (tokens[i].type !== Lexer.T_WHITESPACE) {
					break;
				}
			}

			tokens = tokens.slice(0, i + 1);
		}

		return tokens;
	}


	private static findDependency(expression: Expression, code: string): ExpressionDependency
	{
		for (let i = 0; i < expression.dependencies.length; i++) {
			if (expression.dependencies[i].code === code) {
				return expression.dependencies[i];
			}
		}

		return null;
	}


	private static addDependencies(expression: Expression, dependencies: Array<ExpressionDependency>): void
	{
		for (let i = 0; i < dependencies.length; i++) {
			if (dependencies[i].type === ExpressionDependencyType.Call) {
				expression.callType = ExpressionCallType.Dynamic;
			}

			let previous = ExpressionParser.findDependency(expression, dependencies[i].code);

			if (previous && !previous.exportable && dependencies[i].exportable) {
				previous.exportable = true;

			} else if (!previous) {
				expression.dependencies.push(dependencies[i]);
			}
		}
	}

}
