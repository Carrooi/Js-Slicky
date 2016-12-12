import {expectExpression, expectExpressionError} from '../_testHelpers';

import chai = require('chai');


describe('#ExpressionParser', () => {
	
	describe('parse()', () => {

		it('should parse simple expression', () => {
			expectExpression('a', 'a');
		});

		it('should parse another simple expression', () => {
			expectExpression('s + "-"', 's+"-"');
		});

		it('should parse expression with object access', () => {
			expectExpression('a.b', 'a.b');
		});

		it('should parse array', () => {
			expectExpression('["a", "b", "c"]', '["a","b","c"]');
		});

		it('should parse object', () => {
			expectExpression('{a: "a", b: "b", c: "c"}', '{a:"a",b:"b",c:"c"}');
		});

		it('should parse only textual expression', () => {
			expectExpression('"hello" + " " + "world"', '"hello"+" "+"world"');
		});

		it('should parse groups', () => {
			expectExpression('(1) + (2)', '(1)+(2)');
		});

		it('should parse stacked groups', () => {
			expectExpression('(((1)))', '(((1)))');
		});

		it('should throw error about missing closing parenthesis', () => {
			expectExpressionError('(((1))', 'Expression "(((1))": missing ending ")".');
		});

		it('should parse expression with multiple inner dependencies', () => {
			expectExpression('a.b(c["d"])("e").f[5](g(h["i"]))', 'a.b(c["d"])("e").f[5](g(h["i"]))');
		});

		it('should parse empty expression', () => {
			expectExpression('', '');
		});

		it('should keep whitespace after keyword', () => {
			expectExpression('typeof a === "undefined"', 'typeof a==="undefined"');
		});

	});

});
