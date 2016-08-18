import {SafeEval} from '../Util/SafeEval';
import {Compiler} from '../Compiler';
import {TypeParser, TypeToken} from './TypeParser';
import {VariableParser} from './VariableParser';
import {Code} from '../Util/Code';
import {VariableToken} from '../Interfaces';
import {RenderableView} from '../Views/RenderableView';


export declare interface Expression
{
	code: string,
	expr: TypeToken,
	filters: Array<{name: string, args: Array<TypeToken>}>,
	dependencies: Array<VariableToken>,
}


export class ExpressionParser
{


	public static precompile(expr: string): Expression
	{
		if (expr === '') {
			expr = 'null';
		}

		let result: Expression = {
			code: expr,
			expr: null,
			dependencies: [],
			filters: [],
		};

		let findDependency = (variable: string): VariableToken => {
			for (let i = 0 ; i < result.dependencies.length; i++) {
				if (variable === result.dependencies[i].code) {
					return result.dependencies[i];
				}
			}

			return null;
		};

		let addDependencies = (variables: Array<string>) => {
			for (let i = 0; i < variables.length; i++) {
				let old = findDependency(variables[i]);

				if (!old) {
					result.dependencies.push(VariableParser.parse(variables[i]));
				} else if (!old.exportable && variables[i].match(/^\#/)) {
					old.exportable = true;
				}
			}
		};

		let colonRegExp = ExpressionParser.delimiterRegExp(Compiler.FILTER_ARGUMENT_DELIMITER);
		let parts = ExpressionParser.split(expr, Compiler.FILTER_DELIMITER);

		result.expr = TypeParser.parse(parts.shift());

		if (result.expr.type === TypeParser.TYPE_EXPRESSION) {
			addDependencies(Code.exportVariablesUsages(result.expr.value));

			// remove exportable hash identifier
			result.expr.value = result.expr.value.replace(/\#?([a-zA-Z_\$][a-zA-Z_\$0-9\.\[\]]*)/g, '$1');
		}

		for (let i = 0; i < parts.length; i++) {
			let args = parts[i].match(colonRegExp);
			let filter = {
				name: args.shift().trim(),
				args: [],
			};

			for (let j = 0; j < args.length; j++) {
				let arg = TypeParser.parse(args[j]);
				filter.args.push(arg);

				if (arg.type === TypeParser.TYPE_EXPRESSION) {
					addDependencies(Code.exportVariablesUsages(arg.value));
				}
			}

			result.filters.push(filter);
		}

		return result;
	}


	public static split(expr: string, delimiter: string): Array<string>
	{
		let result = [];
		let inQuotes = false;
		let inGroup = 0;

		for (let i = 0, j = 0; i < expr.length; i++) {
			let l = expr[i];

			if (l === "'" || l === '"') {
				inQuotes = !inQuotes;

			} else if (l === '(' || l === '{' || l === '[') {
				inGroup++;

			} else if (l === ')' || l === '}' || l === ']') {
				inGroup--;
			}

			if (l === delimiter && !inQuotes && !inGroup) {
				j++;
				continue;
			}

			result[j] = result[j] ? result[j] + l : l;
		}

		for (let i = 0; i < result.length; i++) {
			result[i] = result[i].trim();
		}

		return result;
	}


	private static delimiterRegExp(delimiter: string): RegExp
	{
		return new RegExp('(\'[^\']+\'|"[^"]+"|\{[^\{]+\}|[^\\' + delimiter + '])+', 'g');
	}

}
