import {expectExpression} from '../_testHelpers';

import chai = require('chai');


const PARSER_OPTIONS = {
	filterProvider: 'filter(%value, "%filter", [%args])',
	variableProvider: {
		replacement: 'scope.%root',
		exclude: /^\$/,
	},
};


describe('#ExpressionParser.variableProvider', () => {
	
	describe('parse()', () => {

		it('should parse simple expression', () => {
			expectExpression('a', 'scope.a', PARSER_OPTIONS);
		});

		it('should parse simple expression and not update local variable', () => {
			expectExpression('a + $local', 'scope.a+$local', PARSER_OPTIONS);
		});

		it('should correctly update compile object with keys', () => {
			expectExpression('{one: first, two: second}', '{one:scope.first,two:scope.second}', PARSER_OPTIONS);
		});

		it('should parse another simple expression', () => {
			expectExpression('s + "-"', 'scope.s+"-"', PARSER_OPTIONS);
		});

		it('should parse expression with object access', () => {
			expectExpression('a.b', 'scope.a.b', PARSER_OPTIONS);
		});

		it('should parse expression with multiple inner dependencies', () => {
			expectExpression(
				'a.b(c["d"])("e").f[5](g(h["i"]))',
				'scope.a.b(scope.c["d"])("e").f[5](scope.g(scope.h["i"]))',
				PARSER_OPTIONS
			);
		});

		it('should include filters', () => {
			expectExpression('a | b | c', 'filter(filter(scope.a, "b", []), "c", [])', PARSER_OPTIONS);
		});

		it('should include filters with arguments', () => {
			expectExpression(
				'a | b : "test" : 5 | c : 5 : "hello" + " " + "world" : d',
				'filter(filter(scope.a, "b", ["test", 5]), "c", [5, "hello"+" "+"world", scope.d])',
				PARSER_OPTIONS
			);
		});

	});

});
