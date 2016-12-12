import {expectExpression} from '../_testHelpers';

import chai = require('chai');


describe('#ExpressionParser.squareBrackets', () => {
	
	describe('parse()', () => {

		it('should parse expression inside of square parenthesis', () => {
			expectExpression('["a", 1]', '["a",1]');
		});

		it('should parse expression with square parenthesis', () => {
			expectExpression('a["b"]', 'a["b"]');
		});

		it('should parse expression with more square parenthesis', () => {
			expectExpression('a["b"]["c"]', 'a["b"]["c"]');
		});

		it('should parse expression with square brackets after parenthesis', () => {
			expectExpression('a("b")["c"]', 'a("b")["c"]');
		});

		it('should parse expression with square brackets and object access', () => {
			expectExpression('a["b"].c', 'a["b"].c');
		});
		
	});

});
