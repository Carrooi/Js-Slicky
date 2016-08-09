import {VariableToken} from '../Interfaces';


export class VariableParser
{


	public static PATH_TYPE_OBJECT = 0;
	public static PATH_TYPE_ARRAY = 1;


	public static parse(variable: string): VariableToken
	{
		let regex = /\#?([a-zA-Z_\$][a-zA-Z_\$0-9]*)|(\[\d+\])/g;
		let parts = variable.match(regex);

		let token = {
			code: variable,
			name: parts.shift(),
			exportable: false,
			path: [],
		};

		if (token.name.match(/^\#/)) {
			token.exportable = true;
			token.name = token.name.slice(1);
		}

		for (let i = 0; i < parts.length; i++) {
			let part = parts[i];

			if (part.match(/^\[\d+\]$/)) {
				token.path.push({
					value: parseInt(part.slice(1, -1)),
					type: VariableParser.PATH_TYPE_ARRAY,
				});

			} else {
				token.path.push({
					value: part,
					type: VariableParser.PATH_TYPE_OBJECT,
				});
			}
		}

		return token;
	}

}
