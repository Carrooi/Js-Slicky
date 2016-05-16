declare interface Token
{
	type: number,
	value: string,
}


export class TextParser
{


	public static TYPE_TEXT = 0;
	public static TYPE_BINDING = 1;

	public static EXPRESSION_OPEN = '{{';
	public static EXPRESSION_CLOSE = '}}';


	public static parse(template: string): Array<Token>
	{
		let tokens: Array<Token> = [];
		let length = template.length;
		let lastIndex = 0;

		while (lastIndex < length) {
			let index = template.indexOf(TextParser.EXPRESSION_OPEN, lastIndex);

			if (index < 0) {
				tokens.push({
					type: TextParser.TYPE_TEXT,
					value: template.slice(lastIndex),
				});

				break;

			} else {
				if (index > 0 && lastIndex < index) {
					tokens.push({
						type: TextParser.TYPE_TEXT,
						value: template.slice(lastIndex, index),
					});
				}

				lastIndex = index + TextParser.EXPRESSION_OPEN.length;
				index = template.indexOf(TextParser.EXPRESSION_CLOSE, lastIndex);

				if (index < 0) {
					let substring = template.slice(lastIndex - TextParser.EXPRESSION_CLOSE.length);
					let lastToken = tokens[tokens.length - 1];

					if (lastToken && lastToken.type === TextParser.TYPE_TEXT) {
						lastToken.value += substring;
					} else {
						tokens.push({
							type: TextParser.TYPE_TEXT,
							value: substring,
						});
					}

					break;
				}

				let value = template.slice(lastIndex, index).trim();

				tokens.push({
					type: TextParser.TYPE_BINDING,
					value: value,
				});

				lastIndex = index + TextParser.EXPRESSION_CLOSE.length;
			}
		}

		return tokens;
	}

}
