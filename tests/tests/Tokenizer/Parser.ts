import {Parser} from '../../../src/Tokenizer/Parser';
import {TokenType} from '../../../src/Tokenizer/Tokens';

import chai = require('chai');


let expect = chai.expect;


describe('#Tokenizer/Parser', () => {

	describe('parse', () => {

		it('should tokenize simple code', () => {
			let tokens = (new Parser('let hello = "hello world";')).tokens;

			expect(tokens).to.be.eql([
				{type: TokenType.T_KEYWORD, value: 'let'},
				{type: TokenType.T_WHITESPACE, value: ' '},
				{type: TokenType.T_NAME, value: 'hello'},
				{type: TokenType.T_WHITESPACE, value: ' '},
				{type: TokenType.T_CHARACTER, value: '='},
				{type: TokenType.T_WHITESPACE, value: ' '},
				{type: TokenType.T_STRING, value: '"hello world"'},
				{type: TokenType.T_CHARACTER, value: ';'},
			]);
		});

		it('should tokenize code with unknown tokens', () => {
			let tokens = (new Parser('let °°° = °°')).tokens;

			expect(tokens).to.be.eql([
				{type: TokenType.T_KEYWORD, value: 'let'},
				{type: TokenType.T_WHITESPACE, value: ' '},
				{type: TokenType.T_UNKNOWN, value: '°°°'},
				{type: TokenType.T_WHITESPACE, value: ' '},
				{type: TokenType.T_CHARACTER, value: '='},
				{type: TokenType.T_WHITESPACE, value: ' '},
				{type: TokenType.T_UNKNOWN, value: '°°'},
			]);
		});

	});

	describe('iterate', () => {

		it('should iterate through tokens', () => {
			let parser = new Parser('alert("hello world");');
			let iterated = [];
			let token;

			while (token = parser.token) {
				iterated.push(token);
				parser.nextToken();
			}

			expect(iterated).to.be.eql([
				{type: TokenType.T_NAME, value: 'alert'},
				{type: TokenType.T_OPEN_PARENTHESIS, value: '('},
				{type: TokenType.T_STRING, value: '"hello world"'},
				{type: TokenType.T_CLOSE_PARENTHESIS, value: ')'},
				{type: TokenType.T_CHARACTER, value: ';'},
			]);
		});

	});

});
