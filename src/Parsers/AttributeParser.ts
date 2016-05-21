import {TextParser} from './TextParser';


export class AttributeParser
{


	public static parse(value: string): string
	{
		let tokens = TextParser.parse(value);

		if (tokens.length === 1) {
			if (tokens[0].type === TextParser.TYPE_TEXT) {
				return "'" + tokens[0].value + "'";

			} else if (tokens[0].type === TextParser.TYPE_BINDING) {
				return tokens[0].value;
			}

		} else {
			let result = [];

			for (let i = 0; i < tokens.length; i++) {
				let token = tokens[i];

				if (token.type === TextParser.TYPE_TEXT) {
					result.push("'" + token.value + "'");

				} else if (token.type === TextParser.TYPE_BINDING) {
					result.push('(' + token.value + ')');
				}
			}

			return result.join('+');
		}
	}

}
