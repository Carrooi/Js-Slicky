import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';
import {ExpressionDependencyType} from '../../../src/constants';

import chai = require('chai');


let expect = chai.expect;


describe('#ExpressionParser.parenthesis', () => {
	
	describe('parse()', () => {
		
		it('should parse expression inside of parenthesis', () => {
			let expr = ExpressionParser.parse('(a)');

			expect(expr).to.be.eql({
				code: '(a)',
				dependencies: [
					{
						code: 'a',
						root: 'a',
						type: ExpressionDependencyType.Object,
					},
				],
				filters: [],
			});
		});

		it('should parse expression with parenthesis', () => {
			let expr = ExpressionParser.parse('a("b")');

			expect(expr).to.be.eql({
				code: 'a("b")',
				dependencies: [
					{
						code: 'a("b")',
						root: 'a',
						type: ExpressionDependencyType.Call,
					},
				],
				filters: [],
			});
		});

		it('should parse expression with more parenthesis', () => {
			let expr = ExpressionParser.parse('a("b")("c")');

			expect(expr).to.be.eql({
				code: 'a("b")("c")',
				dependencies: [
					{
						code: 'a("b")("c")',
						root: 'a',
						type: ExpressionDependencyType.Call,
					},
				],
				filters: [],
			});
		});

		it('should parse expression with parenthesis after square brackets', () => {
			let expr = ExpressionParser.parse('a["b"]("c")');

			expect(expr).to.be.eql({
				code: 'a["b"]("c")',
				dependencies: [
					{
						code: 'a["b"]("c")',
						root: 'a',
						type: ExpressionDependencyType.Call,
					},
				],
				filters: [],
			});
		});

		it('should parse expression with parenthesis and object access', () => {
			let expr = ExpressionParser.parse('a("b").c');

			expect(expr).to.be.eql({
				code: 'a("b").c',
				dependencies: [
					{
						code: 'a("b").c',
						root: 'a',
						type: ExpressionDependencyType.Call,
					},
				],
				filters: [],
			});
		});

	});

});
