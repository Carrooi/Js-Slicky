import {expectExpression, expectExpressionError} from '../_testHelpers';

import chai = require('chai');


const PARSER_OPTIONS = {
	filterProvider: 'filter(%value, "%filter", [%args])',
	autoWrap: false,
};


describe('#ExpressionParser.filterProvider', () => {
	
	describe('parse()', () => {

		it('should throw an error when filter name is missing', () => {
			expectExpressionError('a | 5', 'Expression "a | 5": filter name expected after "|", got "5".', PARSER_OPTIONS);
		});

		it('should use filter with dash', () => {
			expectExpression('a | filter-a', 'return filter(a, "filter-a", [])', PARSER_OPTIONS);
		});

		it('should include filters', () => {
			expectExpression('a || c | filterA | filterB', 'return filter(filter(a||c, "filterA", []), "filterB", [])', PARSER_OPTIONS);
		});

		it('should parse filters inside of parenthesis', () => {
			expectExpression(
				'8 / (5 | plus : 2 : (3 | plus : 1)) | multiply : 2',
				'return filter(8/(filter(5, "plus", [2, (filter(3, "plus", [1]))])), "multiply", [2])',
				PARSER_OPTIONS
			);
		});

		it('should include filters with arguments', () => {
			expectExpression(
				'a | b : "test" : 5 | c : 5 : "hello" + " " + "world" : d',
				'return filter(filter(a, "b", ["test", 5]), "c", [5, "hello"+" "+"world", d])',
				PARSER_OPTIONS
			);
		});

		it('should parse object inside of filter argument', () => {
			expectExpression('a | b : {c: "d"}', 'return filter(a, "b", [{c:"d"}])', PARSER_OPTIONS);
		});

	});

});
