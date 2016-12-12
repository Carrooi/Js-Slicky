import {expectExpression} from '../_testHelpers';

import chai = require('chai');


describe('#ExpressionParser.parenthesis', () => {
	
	describe('parse()', () => {
		
		it('should parse expression inside of parenthesis', () => {
			expectExpression('(a)', 'return (a)');
		});

		it('should parse expression with parenthesis', () => {
			expectExpression('a("b")', 'return a("b")');
		});

		it('should parse expression with more parenthesis', () => {
			expectExpression('a("b")("c")', 'return a("b")("c")');
		});

		it('should parse expression with parenthesis after square brackets', () => {
			expectExpression('a["b"]("c")', 'return a["b"]("c")');
		});

		it('should parse expression with parenthesis and object access', () => {
			expectExpression('a("b").c', 'return a("b").c');
		});

		it('should parse empty group', () => {
			expectExpression('()', 'return ()');
		});

	});

});
