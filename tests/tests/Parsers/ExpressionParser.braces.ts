import {expectExpression} from '../_testHelpers';

import chai = require('chai');


describe('#ExpressionParser.braces', () => {
	
	describe('parse()', () => {
		
		it('should parse expression inside of braces', () => {
			expectExpression('{a}' ,'return {a}');
		});

		it('should parse expression with braces', () => {
			expectExpression('a{"b"}', 'return a{"b"}');
		});

	});

});
