import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';
import {ExpressionCallType, ExpressionDependencyType} from '../../../src/constants';

import chai = require('chai');


let expect = chai.expect;


describe('#ExpressionParser.braces', () => {
	
	describe('parse()', () => {
		
		it('should parse expression inside of braces', () => {
			let expr = ExpressionParser.parse('{a}');

			expect(expr).to.be.eql({
				code: '{a}',
				callType: ExpressionCallType.Static,
				dependencies: [
					{
						code: 'a',
						root: 'a',
						type: ExpressionDependencyType.Object,
						exportable: false,
					},
				],
				filters: [],
			});
		});

		it('should parse expression with braces', () => {
			let expr = ExpressionParser.parse('a{"b"}');

			expect(expr).to.be.eql({
				code: 'a{"b"}',
				callType: ExpressionCallType.Static,
				dependencies: [
					{
						code: 'a',
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
