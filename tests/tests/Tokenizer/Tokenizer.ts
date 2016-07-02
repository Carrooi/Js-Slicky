import {Tokenizer} from '../../../src/Tokenizer/Tokenizer';
import {Lexer} from '../../../src/Tokenizer/Lexer';

import chai = require('chai');


let expect = chai.expect;


describe('#Tokenizer/Tokenizer', () => {

	describe('tokenize()', () => {

		it('should tokenize simple code', () => {
			let tokenizer = new Tokenizer;

			tokenizer.addRule('T_WORLD', /world/);
			tokenizer.addRule('T_DEVELOPER', /developer/);

			let tokens = tokenizer.tokenize('hello world, I am the best developer.');

			expect(tokens).to.be.eql([
				{type: Lexer.T_UNKNOWN, value: 'hello '},
				{type: 'T_WORLD', value: 'world'},
				{type: Lexer.T_UNKNOWN, value: ', I am the best '},
				{type: 'T_DEVELOPER', value: 'developer'},
				{type: Lexer.T_UNKNOWN, value: '.'},
			]);
		});

	});

});
