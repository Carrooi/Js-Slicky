import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';

import chai = require('chai');


let expect = chai.expect;


describe('#ExpressionParser.squareBrackets', () => {
	
	describe('parse()', () => {

		it('should parse expression inside of square parenthesis', () => {
			let expr = ExpressionParser.parse('["a", 1]');

			expect(expr).to.be.eql({
				code: '["a", 1]',
				dependencies: [],
			});
		});

		it('should parse expression with square parenthesis', () => {
			let expr = ExpressionParser.parse('a["b"]');

			expect(expr).to.be.eql({
				code: 'a["b"]',
				dependencies: [
					{
						code: 'a["b"]',
						root: 'a',
					},
				],
			});
		});

		it('should parse expression with more square parenthesis', () => {
			let expr = ExpressionParser.parse('a["b"]["c"]');

			expect(expr).to.be.eql({
				code: 'a["b"]["c"]',
				dependencies: [
					{
						code: 'a["b"]["c"]',
						root: 'a',
					},
				],
			});
		});

		it('should parse expression with square brackets after parenthesis', () => {
			let expr = ExpressionParser.parse('a("b")["c"]');

			expect(expr).to.be.eql({
				code: 'a("b")["c"]',
				dependencies: [
					{
						code: 'a("b")["c"]',
						root: 'a',
					},
				],
			});
		});

		it('should parse expression with square brackets and object access', () => {
			let expr = ExpressionParser.parse('a["b"].c');

			expect(expr).to.be.eql({
				code: 'a["b"].c',
				dependencies: [
					{
						code: 'a["b"].c',
						root: 'a',
					},
				],
			});
		});
		
	});

});
