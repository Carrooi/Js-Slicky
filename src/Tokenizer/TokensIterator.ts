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


	public is(token: Array<any>|any): boolean
	{
		if (!this.token) {
			return false;
		}

		if (!Helpers.isArray(token)) {
			token = [token];
		}

		return token.indexOf(this.token.type) >= 0;
	}


	public isNext(token: Array<any>|any): boolean
	{
		if (!this.lookahead) {
			return false;
		}

		if (!Helpers.isArray(token)) {
			token = [token];
		}

		return token.indexOf(this.lookahead.type) >= 0;
	}


	public isPrevious(token: Array<any>|any): boolean
	{
		if (typeof this.tokens[this.position - 1] === 'undefined') {
			return false;
		}

		if (!Helpers.isArray(token)) {
			token = [token];
		}

		return token.indexOf(this.tokens[this.position - 1].type) >= 0;
	}


	public nextToken(): Token
	{
		if (typeof this.tokens[this.position + 1] === 'undefined') {
			this.token = null;
			return null;
		}

		this.resetPeek();
		this.position++;
		this.lookahead = this.glimpse();

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
