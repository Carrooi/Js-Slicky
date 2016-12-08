import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';

import chai = require('chai');


let expect = chai.expect;


describe('#ExpressionParser.braces', () => {
	
	describe('parse()', () => {
		
		it('should parse expression inside of braces', () => {
			let expr = ExpressionParser.parse('{a}');

			expect(expr).to.be.eql({
				code: '{a}',
				dependencies: [
					{
						code: 'a',
						root: 'a',
					},
				],
				filters: [],
			});
		});

		it('should parse expression with braces', () => {
			let expr = ExpressionParser.parse('a{"b"}');

			expect(expr).to.be.eql({
				code: 'a{"b"}',
				dependencies: [
					{
						code: 'a',
						root: 'a',
					},
				],
				filters: [],
			});
		});

	});

});
