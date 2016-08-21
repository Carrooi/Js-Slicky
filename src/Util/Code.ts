import {VariableToken, InterpolatedObjectElement} from '../Interfaces';
import {Parser} from '../Tokenizer/Parser';
import {Lexer} from '../Tokenizer/Lexer';


export class Code
{


	public static exportVariablesUsages(code: string): Array<string>
	{
		let parser = new Parser(code);
		let token;

		let variables = [];
		let currentVariable = '';

		let add = () => {
			if (variables.indexOf(currentVariable) === -1 && variables.indexOf('#' + currentVariable)) {
				variables.push(currentVariable);
			}

			currentVariable = '';
		};

		while (token = parser.token) {
			if (token.type === Lexer.T_NAME && !currentVariable.length) {
				let previousToken = parser.tokens[parser.position - 1];
				if (
					!currentVariable.length &&
					typeof previousToken !== 'undefined' &&
					previousToken.type === Lexer.T_UNKNOWN &&
					previousToken.value === '#'
				) {
					currentVariable += '#';
				}

				currentVariable += token.value;

			} else if (
				currentVariable.length &&
				(
					(token.type === Lexer.T_NAME) ||
					(token.type === Lexer.T_NUMBER) ||
					(token.type === Lexer.T_STRING) ||
					(token.type === Lexer.T_OPEN_SQUARE_BRACKET || token.type === Lexer.T_CLOSE_SQUARE_BRACKET) ||
					(token.type === Lexer.T_DOT)
				)
			) {
				currentVariable += token.value;

			} else if (currentVariable.length) {
				add();
			}

			parser.nextToken();
		}

		if (currentVariable.length) {
			add();
		}

		return variables;
	}


	public static interpolateObjectElement(scope: any, token: VariableToken): InterpolatedObjectElement
	{
		let result = {
			obj: scope,
			key: token.name,
		};

		if (!token.path.length) {
			return result;
		}

		if (scope[token.name] == null) {
			return result;
		}

		result.obj = scope[token.name];

		for (let i = 0; i < token.path.length - 1; i++) {
			if (result.obj == null) {
				break;
			}

			result.obj = result.obj[token.path[i].value];
		}

		result.key = token.path[token.path.length - 1].value;

		return result;
	}

}
