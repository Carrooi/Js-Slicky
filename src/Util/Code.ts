import {Parser} from '../Tokenizer/Parser';
import {TokenType} from '../Tokenizer/Tokens';


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
			if (token.type === TokenType.T_NAME && !currentVariable.length) {
				let previousToken = parser.tokens[parser.position - 1];
				if (
					!currentVariable.length &&
					typeof previousToken !== 'undefined' &&
					previousToken.type === TokenType.T_UNKNOWN &&
					previousToken.value === '#'
				) {
					currentVariable += '#';
				}

				currentVariable += token.value;

			} else if (
				currentVariable.length &&
				(
					(token.type === TokenType.T_NAME) ||
					(token.type === TokenType.T_NUMBER) ||
					(token.type === TokenType.T_STRING) ||
					(token.type === TokenType.T_OPEN_SQUARE_BRACKET || token.type === TokenType.T_CLOSE_SQUARE_BRACKET) ||
					(token.type === TokenType.T_DOT)
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

}
