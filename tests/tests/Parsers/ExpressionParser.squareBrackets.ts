import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';
import {ExpressionCallType, ExpressionDependencyType} from '../../../src/constants';

import chai = require('chai');


let expect = chai.expect;


describe('#ExpressionParser.squareBrackets', () => {
	
	describe('parse()', () => {

		it('should parse expression inside of square parenthesis', () => {
			let expr = ExpressionParser.parse('["a", 1]');

			expect(expr).to.be.eql({
				code: '["a", 1]',
				callType: ExpressionCallType.Static,
				dependencies: [],
				filters: [],
			});
		});

		it('should parse expression with square parenthesis', () => {
			let expr = ExpressionParser.parse('a["b"]');

			expect(expr).to.be.eql({
				code: 'a["b"]',
				callType: ExpressionCallType.Static,
				dependencies: [
					{
						code: 'a["b"]',
						root: 'a',
						type: ExpressionDependencyType.Object,
						exportable: false,
					},
				],
				filters: [],
			});
		});

		it('should parse expression with more square parenthesis', () => {
			let expr = ExpressionParser.parse('a["b"]["c"]');

			expect(expr).to.be.eql({
				code: 'a["b"]["c"]',
				callType: ExpressionCallType.Static,
				dependencies: [
					{
						code: 'a["b"]["c"]',
						root: 'a',
						type: ExpressionDependencyType.Object,
						exportable: false,
					},
				],
				filters: [],
			});
		});

		it('should parse expression with square brackets after parenthesis', () => {
			let expr = ExpressionParser.parse('a("b")["c"]');

			expect(expr).to.be.eql({
				code: 'a("b")["c"]',
				callType: ExpressionCallType.Dynamic,
				dependencies: [
					{
						code: 'a("b")["c"]',
						root: 'a',
						type: ExpressionDependencyType.Call,
						exportable: false,
					},
				],
				filters: [],
			});
		});

		it('should parse expression with square brackets and object access', () => {
			let expr = ExpressionParser.parse('a["b"].c');

			expect(expr).to.be.eql({
				code: 'a["b"].c',
				callType: ExpressionCallType.Static,
				dependencies: [
					{
						code: 'a["b"].c',
						root: 'a',
						type: ExpressionDependencyType.Object,
						exportable: false,
					},
				],
				filters: [],
			});
		});
		
	});

});
