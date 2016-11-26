import {Functions} from './Functions';
import {Strings} from './Strings';


declare interface EvalOptions
{
	bindTo?: any,
}


export class SafeEval
{


	public static run(code: string, scope: any = {}, options: EvalOptions = {}): any
	{
		'use strict';

		code = (
			'"use strict";\n' +
			'return (function() {\n' +
				Strings.indent(code) + '\n' +
			'}).call(this);'
		);

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
		return fn.apply(options.bindTo ? options.bindTo : null, values);
	}

}
