import {Token} from './Tokenizer';
import {Helpers} from '../Util/Helpers';


export class TokensIterator
{


	public tokens: Array<Token>;

	public position: number = 0;

	public peekPosition: number = 0;

	public token: Token = null;

	public lookahead: Token = null;


	constructor(tokens: Array<Token>)
	{
		this.tokens = tokens;

		if (this.tokens.length) {
			this.token = this.tokens[0];

			if (this.tokens.length > 1) {
				this.lookahead = this.tokens[1];
			}
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


	public peek(): Token
	{
		if (typeof this.tokens[this.position + this.peekPosition + 1] === 'undefined') {
			return null;
		} else {
			return this.tokens[this.position + ++this.peekPosition];
		}
	}


	public peekSkip(token: Array<any>|any): Token
	{
		if (!Helpers.isArray(token)) {
			token = [token];
		}

		let peek = this.peek();
		if (!peek) {
			return null;
		}

		if (token.indexOf(peek.type) > -1) {
			return this.peekSkip(token);
		}

		return peek;
	}
	
	
	public resetPeek(): void
	{
		this.peekPosition = 0;
	}


	public glimpse(): Token
	{
		let position = this.peekPosition;
		let token = this.peek();
		this.peekPosition = position;

		return token;
	}


	public moveBy(index: number): void
	{
		if (typeof this.tokens[this.position + index] === 'undefined') {
			throw new Error('Tokenizer: invalid index ' + index + '.');
		}

		this.position += index;
		this.resetPeek();
		this.token = this.tokens[this.position];
		this.lookahead = this.glimpse();
	}

}
