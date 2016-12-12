import {expectExpression} from '../_testHelpers';

import chai = require('chai');


const PARSER_OPTIONS = {
	filterProvider: 'filter(%value, "%filter", [%args])',
	variableProvider: {
		replacement: 'scope.%root',
		storeLocally: true,
		exclude: /^\$/,
	},
};


describe('#ExpressionParser.variableProvider', () => {
	
	describe('parse()', () => {

		it('should parse simple expression', () => {
			expectExpression('a', 'var _ref0=scope.a;_ref0', PARSER_OPTIONS);
		});

		it('should parse simple expression and not update local variable', () => {
			expectExpression('a + $local', 'var _ref0=scope.a;_ref0+$local', PARSER_OPTIONS);
		});

		it('should correctly update compile object with keys', () => {
			expectExpression('{one: first, two: second}', 'var _ref0=scope.first,_ref1=scope.second;{one:_ref0,two:_ref1}', PARSER_OPTIONS);
		});

		it('should parse another simple expression', () => {
			expectExpression('s + "-"', 'var _ref0=scope.s;_ref0+"-"', PARSER_OPTIONS);
		});

		it('should parse expression with object access', () => {
			expectExpression('a.b', 'var _ref0=scope.a;_ref0.b', PARSER_OPTIONS);
		});

		it('should parse expression with multiple inner dependencies', () => {
			expectExpression(
				'a.b(c["d"])("e").f[5](g(h["i"]))',
				'var _ref0=scope.a,_ref1=scope.c,_ref2=scope.g,_ref3=scope.h;_ref0.b(_ref1["d"])("e").f[5](_ref2(_ref3["i"]))',
				PARSER_OPTIONS
			);
		});

		it('should include filters', () => {
			expectExpression('a | b | c', 'var _ref0=scope.a;filter(filter(_ref0, "b", []), "c", [])', PARSER_OPTIONS);
		});

		it('should include filters with arguments', () => {
			expectExpression(
				'a | b : "test" : 5 | c : 5 : "hello" + " " + "world" : d',
				'var _ref0=scope.a,_ref1=scope.d;filter(filter(_ref0, "b", ["test", 5]), "c", [5, "hello"+" "+"world", _ref1])',
				PARSER_OPTIONS
			);
		});

		it('should reuse local root variable', () => {
			expectExpression('a.b + b.c / (a.d * b.e)', 'var _ref0=scope.a,_ref1=scope.b;_ref0.b+_ref1.c/(_ref0.d*_ref1.e)', PARSER_OPTIONS);
		});

	});

});
