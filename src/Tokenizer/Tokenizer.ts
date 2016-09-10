import {TokenType} from './Tokens';


declare interface Rule
{
	type: any,
	pattern: RegExp,
}


export declare interface Token
{
	value: string,
	type: any,
}


export class Tokenizer
{


	private rules: Array<Rule> = [];

	private re: RegExp = null;


	public addRule(type: any, pattern: RegExp): void
	{
		this.re = null;
		this.rules.push({
			type: type,
			pattern: pattern,
		});
	}


	public tokenize(input: string): Array<Token>
	{
		this.initialize();

		let tokens = input.match(this.re);
		let result = [];
		let t: string = null;
		let currentType: any = null;
		let append: Token = null;
		let unknown = '';

		for (let i = 0; i < tokens.length; i++) {
			t = tokens[i];
			currentType = null;
			append = null;

			for (let j = 0; j < this.rules.length; j++) {
				let rule = this.rules[j];

				if (t.match(rule.pattern)) {
					currentType = rule.type;
					break;
				}
			}

			if (currentType === TokenType.T_UNKNOWN) {
				unknown += t;
				continue;
			} else if (unknown.length) {
				append = {
					value: t,
					type: currentType,
				};

				t = unknown;
				currentType = TokenType.T_UNKNOWN;
				unknown = '';
			}

			result.push({
				value: t,
				type: currentType,
			});

			if (append) {
				result.push(append);
			}
		}

		if (unknown.length) {
			result.push({
				value: unknown,
				type: TokenType.T_UNKNOWN,
			});
		}

		return result;
	}


	private initialize(): void
	{
		if (this.re !== null) {
			return;
		}

		this.addRule(TokenType.T_UNKNOWN, /(?:.+?)/);

		this.re = new RegExp('(' + this.rules.map((rule: Rule) => {
			let e = rule.pattern.toString();
			return '(?:' + e.substring(1, e.length - 1) + ')';
		}).join('|') + ')', 'g');
	}

}
