import {Token} from './Tokenizer';


export class TokensIterator
{


	public tokens: Array<Token>;

	public position: number = 0;

	public token: Token = null;


	constructor(tokens: Array<Token>)
	{
		this.tokens = tokens;
		if (this.tokens.length) {
			this.token = this.tokens[0];
		}
	}


	public nextToken(): Token
	{
		if (typeof this.tokens[++this.position] === 'undefined') {
			this.token = null;
			return null;
		}

		return this.token = this.tokens[this.position];
	}


	public getNextToken(): Token
	{
		return typeof this.tokens[this.position + 1] === 'undefined' ?
			null :
			this.tokens[this.position + 1]
		;
	}

}
