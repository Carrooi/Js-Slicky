import {Parser} from '../../../src/Tokenizer/Parser';
import {Lexer} from '../../../src/Tokenizer/Lexer';

import chai = require('chai');


let expect = chai.expect;


describe('#Tokenizer/Parser', () => {

	describe('parse', () => {

		it('should tokenize simple code', () => {
			let tokens = (new Parser('let hello = "hello world";')).tokens;

			expect(tokens).to.be.eql([
				{type: Lexer.T_KEYWORD, value: 'let'},
				{type: Lexer.T_WHITESPACE, value: ' '},
				{type: Lexer.T_NAME, value: 'hello'},
				{type: Lexer.T_WHITESPACE, value: ' '},
				{type: Lexer.T_CHARACTER, value: '='},
				{type: Lexer.T_WHITESPACE, value: ' '},
				{type: Lexer.T_STRING, value: '"hello world"'},
				{type: Lexer.T_CHARACTER, value: ';'},
			]);
		});

		it('should tokenize code with unknown tokens', () => {
			let tokens = (new Parser('let °°° = °°')).tokens;

			expect(tokens).to.be.eql([
				{type: Lexer.T_KEYWORD, value: 'let'},
				{type: Lexer.T_WHITESPACE, value: ' '},
				{type: Lexer.T_UNKNOWN, value: '°°°'},
				{type: Lexer.T_WHITESPACE, value: ' '},
				{type: Lexer.T_CHARACTER, value: '='},
				{type: Lexer.T_WHITESPACE, value: ' '},
				{type: Lexer.T_UNKNOWN, value: '°°'},
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
				{type: Lexer.T_NAME, value: 'alert'},
				{type: Lexer.T_PARENTHESIS, value: '('},
				{type: Lexer.T_STRING, value: '"hello world"'},
				{type: Lexer.T_PARENTHESIS, value: ')'},
				{type: Lexer.T_CHARACTER, value: ';'},
			]);
		});

	});

});
