import {VariableParser, VariableToken} from './VariableParser';


export declare interface ForToken
{
	code: string,
	key?: VariableToken,
	value: VariableToken,
	obj: VariableToken,
	type: number,
}


export class ForParser
{


	public static TYPE_ARRAY = 0;
	public static TYPE_OBJECT = 1;


	public static parse(code: string): ForToken
	{
		let varRegExp = '[a-zA-Z_\\$][a-zA-Z_\\$0-9\\.\\[\\]]*';
		let forRegExp = new RegExp('^(\\#?' + varRegExp + ')(?:,\\s+(\\#?' + varRegExp + '))?\\s+(in|of)\\s+(' + varRegExp + ')$');

		let parts = code.match(forRegExp);

		if (!parts) {
			throw new Error('ForParser: invalid for expression "' + code + '".');
		}

		let hasKey = typeof parts[2] !== 'undefined';

		return {
			code: code,
			key: hasKey ? VariableParser.parse(parts[1]) : null,
			value: VariableParser.parse(hasKey ? parts[2] : parts[1]),
			obj: VariableParser.parse(parts[4]),
			type: parts[3] === 'in' ? ForParser.TYPE_ARRAY : ForParser.TYPE_OBJECT,
		};
	}

}
