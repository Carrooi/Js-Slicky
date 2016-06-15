import {VariableToken} from '../Parsers/VariableParser';


export declare interface InterpolatedObjectElement
{
	obj: any,
	key: string|number,
}


export class Code
{


	public static PATH_TYPE_OBJECT = 0;
	public static PATH_TYPE_ARRAY = 1;


	// of is for ForDirective
	private static RESERVED_WORDS = [
		'do', 'if', 'in', 'of', 'for', 'let', 'new', 'try', 'var', 'case', 'else', 'enum', 'eval', 'false', 'null', 'this', 'true', 'void', 'with', 'break', 'catch', 'class', 'const', 'super', 'throw', 'while', 'yield', 'delete', 'export', 'import', 'public', 'return', 'static', 'switch', 'typeof', 'default', 'extends', 'finally', 'package', 'private', 'continue', 'debugger', 'function', 'arguments', 'interface', 'protected', 'implements', 'instanceof'
	];


	public static exportVariablesUsages(code: string): Array<string>
	{
		let regex = /\#?[a-zA-Z_\$][a-zA-Z_\$0-9\.\[\]]*/g;
		let variables = code.match(regex);

		if (!variables) {
			return [];
		}

		return variables.filter((value: string, i: number) => {
			let exported = variables.indexOf('#' + value);

			if (exported > -1 && variables.indexOf('#' + value) !== i) {
				return false;
			}

			return Code.RESERVED_WORDS.indexOf(value) === -1 && variables.indexOf(value) === i;
		});
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
