import {Lexer} from './Lexer';
import {Tokenizer, Token} from './Tokenizer';
import {Helpers} from '../Util/Helpers';
import {TokensIterator} from './TokensIterator';


export class Parser extends TokensIterator
{


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

		t.addRule(Lexer.T_CHARACTER, /[;:\?\^%<>=!&|+\-,~]/);
		t.addRule(Lexer.T_DOT, /\./);

		t.addRule(Lexer.T_OPEN_PARENTHESIS, /\(/);
		t.addRule(Lexer.T_CLOSE_PARENTHESIS, /\)/);
		t.addRule(Lexer.T_OPEN_BRACES, /\{/);
		t.addRule(Lexer.T_CLOSE_BRACES, /}/);
		t.addRule(Lexer.T_OPEN_SQUARE_BRACKET, /\[/);
		t.addRule(Lexer.T_CLOSE_SQUARE_BRACKET, /]/);

		super(t.tokenize(input));
	}

}
