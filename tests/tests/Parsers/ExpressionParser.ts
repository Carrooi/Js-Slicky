import {expectExpression, expectExpressionError} from '../_testHelpers';

import chai = require('chai');


describe('#ExpressionParser', () => {
	
	describe('parse()', () => {

		it('should parse simple expression', () => {
			expectExpression('a', 'return a');
		});

		it('should parse another simple expression', () => {
			expectExpression('s + "-"', 'return s+"-"');
		});

		it('should parse expression with object access', () => {
			expectExpression('a.b', 'return a.b');
		});

		it('should parse array', () => {
			expectExpression('["a", "b", "c"]', 'return ["a","b","c"]');
		});

		it('should parse object', () => {
			expectExpression('{a: "a", b: "b", c: "c"}', 'return {a:"a",b:"b",c:"c"}');
		});

		it('should parse only textual expression', () => {
			expectExpression('"hello" + " " + "world"', 'return "hello"+" "+"world"');
		});

		it('should parse groups', () => {
			expectExpression('(1) + (2)', 'return (1)+(2)');
		});

		it('should parse stacked groups', () => {
			expectExpression('(((1)))', 'return (((1)))');
		});

		it('should throw error about missing closing parenthesis', () => {
			expectExpressionError('(((1))', 'Expression "(((1))": missing ending ")".');
		});

		it('should parse expression with multiple inner dependencies', () => {
			expectExpression('a.b(c["d"])("e").f[5](g(h["i"]))', 'return a.b(c["d"])("e").f[5](g(h["i"]))');
		});

		it('should parse empty expression', () => {
			expectExpression('', 'return undefined');
		});

		it('should parse empty expression with auto wrapping', () => {
			expectExpression('', '(function() {return undefined})()', {
				autoWrap: true,
			});
		});

		it('should keep whitespace after keyword', () => {
			expectExpression('typeof a === "undefined"', 'return typeof a==="undefined"');
		});

		it('should wrap whole code into function', () => {
			expectExpression('a', '(function() {return a})()', {
				autoWrap: true,
			});
		});

		it('should add return keyword to one statement with semicolon', () => {
			expectExpression('a;', 'return a;');
		});

		it('should not add new return keyword', () => {
			expectExpression('a; return b; c', 'a;return b;c');
		});

		it('should add return keyword to the last command', () => {
			expectExpression('a; b; c', 'a;b;return c');
		});

		it('should add return keyword to the last command, not last semicolon', () => {
			expectExpression('a; b; c;', 'a;b;return c;');
		});

	});

});
