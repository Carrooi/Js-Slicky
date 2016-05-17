import {SafeEval} from '../../Util/SafeEval';
import {Compiler} from '../../Compiler';
import {TypeParser, TypeToken} from './TypeParser';
import {VariableParser, VariableToken} from './VariableParser';
import {Code} from '../../Util/Code';


export declare interface Expression
{
	code: string,
	expr: TypeToken,
	filters: Array<{name: string, args: Array<TypeToken>}>,
	dependencies: Array<VariableToken>,
}


export class ExpressionParser
{


	public static parse(expr: Expression, scope: any = {}, filters: {[name: string]: any} = {}): any
	{
		let exprScope = {};
		let instantiate = [];
		let exports = [];

		for (let i = 0; i < expr.dependencies.length; i++) {
			let dependency = expr.dependencies[i];

			if (dependency.exportable) {
				exports.push(dependency.name);
			}

			if (typeof scope[dependency.name] === 'undefined' && dependency.exportable) {
				instantiate.push(dependency.name);
			} else {
				exprScope[dependency.name] = scope[dependency.name];
			}
		}

		let result = expr.expr.value;
		if (expr.expr.type === TypeParser.TYPE_EXPRESSION) {
			let evalResult = SafeEval.run('return ' + result, exprScope, {instantiate: instantiate, exports: exports});
			result = evalResult.result;

			// synchronized scope with exported local variables from expression
			for (let exportVar in evalResult.exports) {
				if (evalResult.exports.hasOwnProperty(exportVar)) {
					scope[exportVar] = evalResult.exports[exportVar];
				}
			}
		}

		for (let i = 0; i < expr.filters.length; i++) {
			let filter = expr.filters[i];

			if (typeof filters[filter.name] === 'undefined') {
				throw new Error('Could not call filter "' + filter.name + '" in "' + expr.code + '" expression, filter is not registered.');
			}

			let args = [result];

			for (let j = 0; j < filter.args.length; j++) {
				let arg = filter.args[j];
				args.push(arg.type === TypeParser.TYPE_PRIMITIVE ? arg.value : SafeEval.run('return ' + arg.value, exprScope, {instantiate: instantiate}).result);
			}

			result = filters[filter.name].apply(null, args);
		}

		return result;
	}


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
		let reg = ExpressionParser.delimiterRegExp(delimiter);
		let result = expr.match(reg);

		for (let i = 0; i < result.length; i++) {
			result[i] = result[i].trim();
		}

		return result;
	}


	private static delimiterRegExp(delimiter: string): RegExp
	{
		return new RegExp('(\'[^\']+\'|"[^"]+"|[^\\' + delimiter + '])+', 'g');
	}

}
