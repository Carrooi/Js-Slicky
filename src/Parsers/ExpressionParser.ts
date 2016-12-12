import {Tokenizer, Token} from '../Tokenizer/Tokenizer';
import {TokenType} from '../Tokenizer/Tokens';
import {TokensIterator} from '../Tokenizer/TokensIterator';


export declare interface ExpressionParserOptions
{
	variableProvider?: {replacement?: string, exclude?: RegExp, storeLocally?: boolean},
	filterProvider?: string,
	autoWrap?: boolean,
	allowFilters?: boolean,
	referencesStorage?: Array<string>;
	autoReturn?: boolean,
}


export class ExpressionParser
{


	private static REFERENCE_PREFIX = '_ref';

	private static TEMP_RETURN = '%expr_return%';


	private code: string;

	private result: string = '';

	private variableProvider: {replacement?: string, exclude?: RegExp, storeLocally?: boolean};

	private filterProvider: string;

	private allowFilters: boolean = true;

	private autoWrap: boolean = true;

	private autoReturn: boolean = true;

	private iterator: TokensIterator;

	private processingVariable: boolean = false;

	private references: Array<string> = [];

	private hasReturn: boolean = false;

	private isMultiExpression: boolean = false;


	constructor(code: string, options: ExpressionParserOptions = {})
	{
		this.code = code;

		if (typeof options.variableProvider !== 'undefined') {
			this.variableProvider = options.variableProvider;
		}

		if (typeof options.filterProvider !== 'undefined') {
			this.filterProvider = options.filterProvider;
		}

		if (typeof options.allowFilters !== 'undefined') {
			this.allowFilters = options.allowFilters;
		}

		if (typeof options.referencesStorage !== 'undefined') {
			this.references = options.referencesStorage;
		}

		if (typeof options.autoReturn !== 'undefined') {
			this.autoReturn = options.autoReturn;
		}

		if (typeof options.autoWrap !== 'undefined') {
			this.autoWrap = options.autoWrap;
		}
	}


	public parse(): string
	{
		let code = this.processTokens(ExpressionParser.createTokensIterator(this.code));
		let prepend = '';

		// add collected references
		let references = [];
		for (let i = 0; i < this.references.length; i++) {
			references.push(ExpressionParser.REFERENCE_PREFIX + i + '=' + this.references[i]);
		}

		if (references.length) {
			prepend += 'var ' + references.join(',') + ';';
		}

		// add return to last command
		if (this.autoReturn && code !== '') {
			if (this.isMultiExpression) {
				if (!this.hasReturn) {
					let split = code.lastIndexOf(ExpressionParser.TEMP_RETURN);
					code = code.substring(0, split) + 'return ' + code.substring(split + ExpressionParser.TEMP_RETURN.length);
				}

				code = code.replace(new RegExp(ExpressionParser.TEMP_RETURN, 'g'), '');
			} else {
				prepend += 'return ';
			}
		}

		if (code === '') {
			code = 'return undefined';
		}

		code = prepend + code;

		if (this.autoWrap) {
			code = '(function() {' + code + '})()';
		}

		return code;
	}


	protected processTokens(iterator: TokensIterator): string
	{
		this.iterator = iterator;
		this.result = '';

		while (this.iterator.token) {
			let code = this.parseToken();

			this.result += code;
			this.iterator.nextToken();
		}

		return this.result;
	}


	private parseToken(): string
	{
		let code = this.iterator.token.value;

		if (this.iterator.is(TokenType.T_WHITESPACE)) {
			code = this.parseWhitespace();

		} else if (this.iterator.is([TokenType.T_NAME, TokenType.T_DOT])) {
			code = this.parseVariable();

		} else if (this.iterator.is([TokenType.T_OPEN_PARENTHESIS, TokenType.T_OPEN_SQUARE_BRACKET, TokenType.T_OPEN_BRACES])) {
			code = this.parseGroup();

		} else if (this.iterator.is(TokenType.T_SEMICOLON)) {
			code = this.parseSemicolon();

		} else if (this.iterator.is(TokenType.T_KEYWORD) && this.iterator.token.value === 'return') {
			code = this.parseReturn();

		} else if (this.iterator.is(TokenType.T_PIPE) && this.allowFilters && this.filterProvider) {
			code = this.parseFilter();
		}

		return code;
	}


	private parseWhitespace(): string
	{
		if (this.iterator.isPrevious(TokenType.T_KEYWORD)) {
			return this.iterator.token.value;
		}

		return '';
	}


	private parseVariable(): string
	{
		let continuousTokens = [
			TokenType.T_DOT, TokenType.T_NAME, TokenType.T_WHITESPACE,
			TokenType.T_OPEN_PARENTHESIS, TokenType.T_OPEN_SQUARE_BRACKET,
		];

		let code = this.iterator.token.value;
		let peek: Token;

		// object key
		if (
			(peek = this.iterator.peek()) &&
			(
				(peek.type === TokenType.T_COLON) ||
				(peek.type === TokenType.T_WHITESPACE && (peek = this.iterator.peek()) && peek.type === TokenType.T_COLON)
			)
		) {
			return code;
		}

		this.iterator.resetPeek();

		// replace root with variable provider
		if (
			!this.processingVariable && this.variableProvider && this.variableProvider.replacement &&
			(!this.variableProvider.exclude || !this.variableProvider.exclude.test(code))
		) {
			code = this.variableProvider.replacement.replace(/%root/g, code);
		}

		// store root into local scope
		if (
			!this.processingVariable && this.variableProvider && this.variableProvider.storeLocally &&
			(!this.variableProvider.exclude || !this.variableProvider.exclude.test(code))
		) {
			code = this.reference(code);
		}

		let isRoot = !this.processingVariable;

		this.processingVariable = true;

		while (this.iterator.lookahead) {
			if (!this.iterator.isNext(continuousTokens)) {
				break;
			}

			this.iterator.nextToken();
			code += this.parseToken();
		}

		if (isRoot) {
			this.processingVariable = false;
		}

		return code;
	}


	private parseSemicolon(): string
	{
		if (!this.autoReturn) {
			return this.iterator.token.value;
		}

		let isLast = true;
		let peek: Token;
		while (peek = this.iterator.peek()) {
			if (peek.type !== TokenType.T_WHITESPACE) {
				isLast = false;
				break;
			}
		}

		if (isLast) {
			return this.iterator.token.value;
		}

		this.isMultiExpression = true;

		return this.iterator.token.value + ExpressionParser.TEMP_RETURN;
	}


	private parseReturn(): string
	{
		if (this.autoReturn) {
			this.hasReturn = true;
		}

		return this.iterator.token.value;
	}


	private parseGroup(): string
	{
		let code = this.iterator.token.value;
		let endPosition: number = null;
		let groups = 1;
		let peek: Token;

		let openingToken = this.iterator.token.type;
		let closingToken: TokenType;

		if (openingToken === TokenType.T_OPEN_PARENTHESIS) {
			closingToken = TokenType.T_CLOSE_PARENTHESIS;

		} else if (openingToken === TokenType.T_OPEN_SQUARE_BRACKET) {
			closingToken = TokenType.T_CLOSE_SQUARE_BRACKET;

		} else if (openingToken === TokenType.T_OPEN_BRACES) {
			closingToken = TokenType.T_CLOSE_BRACES;

		} else {
			throw this.error('invalid group start "' + this.iterator.token.value + '"');
		}

		while (peek = this.iterator.peek()) {
			if (peek.type === openingToken) {
				groups++;
			}

			if (peek.type === closingToken) {
				groups--;

				if (groups === 0) {
					endPosition = this.iterator.position + this.iterator.peekPosition;
					break;
				}
			}
		}

		if (endPosition === null) {
			throw this.error('missing ending ")"');
		}

		this.iterator.nextToken();

		let innerIterator = new TokensIterator(this.iterator.tokens.slice(this.iterator.position, endPosition));

		if (innerIterator.token) {
			let innerParser = new ExpressionParser(this.code, {
				variableProvider: this.variableProvider,
				filterProvider: this.filterProvider,
				referencesStorage: this.references,
				allowFilters: openingToken === TokenType.T_OPEN_PARENTHESIS,
				autoReturn: false,
			});

			let inner = innerParser.processTokens(innerIterator);

			this.iterator.moveBy(innerIterator.position + 1);

			code += inner;
		}

		return code + this.iterator.token.value;
	}


	private parseFilter(): string
	{
		if (this.iterator.isNext(TokenType.T_WHITESPACE)) {
			this.iterator.nextToken();
		}

		this.iterator.nextToken();

		if (!this.iterator.is(TokenType.T_NAME)) {
			throw this.error('filter name expected after "|", got "' + this.iterator.token.value + '"');
		}

		let filter = this.iterator.token.value;

		this.iterator.nextToken();

		let args = [];
		let arg = '';

		while (this.iterator.token) {
			if (this.iterator.isNext(TokenType.T_PIPE)) {
				break;
			}

			if (this.iterator.is(TokenType.T_COLON)) {
				if (arg !== '') {
					args.push(arg);
					arg = '';
				}

				this.iterator.nextToken();
				continue;
			}

			arg += this.parseToken();
			this.iterator.nextToken();
		}

		if (arg !== '') {
			args.push(arg);
		}

		this.result = this.filterProvider
			.replace(/%value/g, this.result.trim())
			.replace(/%filter/g, filter)
			.replace(/%args/g, args.join(', '))
		;

		return '';
	}


	private reference(variable: string): string
	{
		let old = this.references.indexOf(variable);

		if (old >= 0) {
			return ExpressionParser.REFERENCE_PREFIX + old;
		}

		this.references.push(variable);
		return ExpressionParser.REFERENCE_PREFIX + (this.references.length - 1);
	}


	private error(message: string): Error
	{
		return new Error('Expression "' + this.code + '": ' + message + '.');
	}


	private static createTokensIterator(code: string): any
	{
		let t = new Tokenizer;

		t.addRule(TokenType.T_STRING, /(?:"(?:(?:\\\n|\\"|[^"\n]))*?")|(?:'(?:(?:\\\n|\\'|[^'\n]))*?')/);
		t.addRule(TokenType.T_REGEXP, /\/(?:(?:\\\/|[^\n\/]))*?\//);
		t.addRule(TokenType.T_COMMENT, /(?:\/\*[\s\S]*?\*\/)|(?:\/\/.*?\n)/);
		t.addRule(TokenType.T_WHITESPACE, /\s+/);

		t.addRule(TokenType.T_KEYWORD, /\b(?:do|if|in|of|for|let|new|try|var|case|else|enum|eval|false|null|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)\b/);

		t.addRule(TokenType.T_NAME, /[a-zA-Z_\$][a-zA-Z_\$0-9]*/);
		t.addRule(TokenType.T_NUMBER, /\d+(?:\.\d+)?(?:e[+-]?\d+)?/);

		t.addRule(TokenType.T_AND, /&{2}/);
		t.addRule(TokenType.T_OR, /\|{2}/);

		t.addRule(TokenType.T_CHARACTER, /[\?\^%<>=!&+\-,~]/);
		t.addRule(TokenType.T_PIPE, /\|/);
		t.addRule(TokenType.T_DOT, /\./);
		t.addRule(TokenType.T_COLON, /:/);
		t.addRule(TokenType.T_SEMICOLON, /;/);

		t.addRule(TokenType.T_OPEN_PARENTHESIS, /\(/);
		t.addRule(TokenType.T_CLOSE_PARENTHESIS, /\)/);
		t.addRule(TokenType.T_OPEN_BRACES, /\{/);
		t.addRule(TokenType.T_CLOSE_BRACES, /}/);
		t.addRule(TokenType.T_OPEN_SQUARE_BRACKET, /\[/);
		t.addRule(TokenType.T_CLOSE_SQUARE_BRACKET, /]/);

		return new TokensIterator(t.tokenize(code));
	}

}
