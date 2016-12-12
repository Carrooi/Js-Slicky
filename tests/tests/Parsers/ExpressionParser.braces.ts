import {expectExpression} from '../_testHelpers';

import chai = require('chai');


describe('#ExpressionParser.braces', () => {
	
	describe('parse()', () => {
		
		it('should parse expression inside of braces', () => {
			expectExpression('{a}' ,'{a}');
		});

		it('should parse expression with braces', () => {
			expectExpression('a{"b"}', 'a{"b"}');
		});

	});

});
