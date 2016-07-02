import {Lexer} from './Lexer';
import {Tokenizer, Token} from './Tokenizer';
import {Helpers} from '../Util/Helpers';


export class Parser
{


	public tokens: Array<Token>;

	public position: number = 0;

	public token: Token = null;


	constructor(input: string)
	{
		let t = new Tokenizer;

		t.addRule(Lexer.T_STRING, /(?:"(?:(?:\\\n|\\"|[^"\n]))*?")|(?:'(?:(?:\\\n|\\'|[^'\n]))*?')/);
		t.addRule(Lexer.T_REGEXP, /\/(?:(?:\\\/|[^\n\/]))*?\//);
		t.addRule(Lexer.T_COMMENT, /(?:\/\*[\s\S]*?\*\/)|(?:\/\/.*?\n)/);
		t.addRule(Lexer.T_WHITESPACE, /\s+/);

		t.addRule(Lexer.T_KEYWORD, /\b(?:do|if|in|of|for|let|new|try|var|case|else|enum|eval|false|null|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)\b/);

		t.addRule(Lexer.T_NAME, /[a-zA-Z_\$][a-zA-Z_\$0-9]*/);
		t.addRule(Lexer.T_NUMBER, /\d+(?:\.\d+)?(?:e[+-]?\d+)?/);

		t.addRule(Lexer.T_CHARACTER, /[;.:\?\^%<>=!&|+\-,~]/);

		t.addRule(Lexer.T_PARENTHESIS, /[\(\)]/);
		t.addRule(Lexer.T_BRACES, /[\{}]/);
		t.addRule(Lexer.T_SQUARE_BRACKET, /[\[\]]/);

		this.tokens = t.tokenize(input);

		if (this.tokens.length) {
			this.token = this.tokens[0];
		}
	}


	public isCurrentToken(type: string|Array<string>)
	{
		if (!this.token) {
			return false;
		}

		if (!Helpers.isArray(type)) {
			type = <any>[type];
		}

		return (<Array<string>>type).indexOf(this.token.type) > -1;
	}


	public nextToken(): Token
	{
		if (typeof this.tokens[++this.position] === 'undefined') {
			this.token = null;
			return null;
		}

		return this.token = this.tokens[this.position];
	}

}
