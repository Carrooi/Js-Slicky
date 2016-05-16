import {Functions} from './Functions';


declare interface EvalOptions
{
	instantiate?: Array<string>,
	exports?: Array<string>,
}


export class SafeEval
{


	public static run(code: string, scope: any = {}, options: EvalOptions = {}): {result: any, exports: {[name: string]: any}}
	{
		'use strict';

		let prepend = ["'use strict'"];

		if (options.instantiate) {
			for (let i = 0; i < options.instantiate.length; i++) {
				prepend.push('var ' + options.instantiate[i] + ' = null');
			}
		}

		let returnName = '__slicky_return_' + Date.now() + '__';
		let exportName = '__slicky_export_' + Date.now() + '__';

		scope[exportName] = {};

		code = 'var ' + returnName + ' = (function() { ' + code + ' }).call(this); ';

		if (options.exports) {
			for (let i = 0; i < options.exports.length; i++) {
				let exportVar = options.exports[i];
				code += 'if (typeof ' + exportVar + ' !== "undefined") ' + exportName + '["' + exportVar + '"] = ' + exportVar + '; ';
			}
		}

		code += 'return ' + returnName + ';';
		code = prepend.join('; ') + '; ' + code;

		let keys = [];
		let values = [];

		for (let varName in scope) {
			if (scope.hasOwnProperty(varName)) {
				keys.push(varName);
				values.push(scope[varName]);
			}
		}

		keys.push(code);

		let fn = Functions.newInstance(Function, keys)();

		let result = fn.apply(null, values);

		return {
			result: result,
			exports: scope[exportName],
		};
	}

}
