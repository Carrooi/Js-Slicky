import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';

import chai = require('chai');


let expect = chai.expect;


describe('#ExpressionParser.parenthesis', () => {
	
	describe('parse()', () => {
		
		it('should parse expression inside of parenthesis', () => {
			let expr = ExpressionParser.parse('(a)');

			expect(expr).to.be.eql('(a)');
		});

		it('should parse expression with parenthesis', () => {
			let expr = ExpressionParser.parse('a("b")');

			expect(expr).to.be.eql('a("b")');
		});

		it('should parse expression with more parenthesis', () => {
			let expr = ExpressionParser.parse('a("b")("c")');

			expect(expr).to.be.eql('a("b")("c")');
		});

		it('should parse expression with parenthesis after square brackets', () => {
			let expr = ExpressionParser.parse('a["b"]("c")');

			expect(expr).to.be.eql('a["b"]("c")');
		});

		it('should parse expression with parenthesis and object access', () => {
			let expr = ExpressionParser.parse('a("b").c');

			expect(expr).to.be.eql('a("b").c');
		});

	});

});
