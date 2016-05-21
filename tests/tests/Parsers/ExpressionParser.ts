import {ExpressionParser, Expression} from '../../../src/Parsers/ExpressionParser';
import {TypeParser} from '../../../src/Parsers/TypeParser';
import {VariableParser} from '../../../src/Parsers/VariableParser';

import chai = require('chai');


let expect = chai.expect;


describe('#Parsers/ExpressionParser', () => {

	describe('precompile()', () => {

		it('should precompile simple expression', () => {
			let result = ExpressionParser.precompile('s + "-"');

			expect(result).to.be.eql({
				code: 's + "-"',
				expr: {value: 's + "-"', type: TypeParser.TYPE_EXPRESSION},
				dependencies: [{name: 's', code: 's', exportable: false, path: []}],
				filters: [],
			});
		});

		it('should precompile expression with exportable variables', () => {
			let result = ExpressionParser.precompile('#b = a && #c = b');

			expect(result).to.be.eql({
				code: '#b = a && #c = b',
				expr: {value: 'b = a && c = b', type: TypeParser.TYPE_EXPRESSION},
				dependencies: [
					{name: 'b', code: '#b', exportable: true, path: []},
					{name: 'a', code: 'a', exportable: false, path: []},
					{name: 'c', code: '#c', exportable: true, path: []},
				],
				filters: [],
			});
		});

		it('should precompile nested variables', () => {
			let result = ExpressionParser.precompile('a.b.c[2].d[3] + e - f[5]');

			expect(result).to.be.eql({
				code: 'a.b.c[2].d[3] + e - f[5]',
				expr: {value: 'a.b.c[2].d[3] + e - f[5]', type: TypeParser.TYPE_EXPRESSION},
				dependencies: [
					{
						name: 'a',
						code: 'a.b.c[2].d[3]',
						exportable: false,
						path: [
							{value: 'b', type: VariableParser.PATH_TYPE_OBJECT},
							{value: 'c', type: VariableParser.PATH_TYPE_OBJECT},
							{value: 2, type: VariableParser.PATH_TYPE_ARRAY},
							{value: 'd', type: VariableParser.PATH_TYPE_OBJECT},
							{value: 3, type: VariableParser.PATH_TYPE_ARRAY},
						],
					},
					{
						name: 'e',
						code: 'e',
						exportable: false,
						path: [],
					},
					{
						name: 'f',
						code: 'f[5]',
						exportable: false,
						path: [
							{value: 5, type: VariableParser.PATH_TYPE_ARRAY},
						],
					},
				],
				filters: [],
			});
		});

		it('should precompile advanced expression', () => {
			let result = ExpressionParser.precompile('str + "-" | a | b : 5 : "B:|B" : \'C|:C\' | c : p1 + p2 + p3 - p4');

			expect(result).to.be.eql({
				code: 'str + "-" | a | b : 5 : "B:|B" : \'C|:C\' | c : p1 + p2 + p3 - p4',
				expr: {value: 'str + "-"', type: TypeParser.TYPE_EXPRESSION},
				dependencies: [
					{name: 'str', code: 'str', exportable: false, path: []},
					{name: 'p1', code: 'p1', exportable: false, path: []},
					{name: 'p2', code: 'p2', exportable: false, path: []},
					{name: 'p3', code: 'p3', exportable: false, path: []},
					{name: 'p4', code: 'p4', exportable: false, path: []},
				],
				filters: [
					{
						name: 'a',
						args: [],
					},
					{
						name: 'b',
						args: [
							{value: 5, type: TypeParser.TYPE_PRIMITIVE},
							{value: 'B:|B', type: TypeParser.TYPE_PRIMITIVE},
							{value: 'C|:C', type: TypeParser.TYPE_PRIMITIVE},
						],
					},
					{
						name: 'c',
						args: [
							{value: 'p1 + p2 + p3 - p4', type: TypeParser.TYPE_EXPRESSION},
						],
					},
				],
			});
		});

	});

	describe('parse()', () => {

		it('should evaluate simple variable from expression', () => {
			let expr: Expression = {
				code: 'a',
				expr: {value: 'a', type: TypeParser.TYPE_EXPRESSION},
				dependencies: [{code: 'a', name: 'a', exportable: false, path: []}],
				filters: [],
			};

			let result = ExpressionParser.parse(expr, {a: 42});

			expect(result).to.be.equal(42);
		});

		it('should automatically instantiate undefined exportable variables', () => {
			let expr: Expression = {
				code: '#a',
				expr: {value: 'a', type: TypeParser.TYPE_EXPRESSION},
				dependencies: [{code: '#a', name: 'a', exportable: true, path: []}],
				filters: [],
			};

			let result = ExpressionParser.parse(expr);

			expect(result).to.be.equal(null);
		});

		it('should export local variables', () => {
			let expr: Expression = {
				code: '#b = a',
				expr: {value: 'b = a', type: TypeParser.TYPE_EXPRESSION},
				dependencies: [
					{code: '#b', name: 'b', exportable: true, path: []},
					{code: 'a', name: 'a', exportable: false, path: []},
				],
				filters: [],
			};

			let scope = {a: 5};

			let result = ExpressionParser.parse(expr, scope);

			expect(result).to.be.equal(5);
			expect(scope).to.be.eql({
				a: 5,
				b: 5,
			});
		});

		it('should evaluate expression', () => {
			let expr: Expression = {
				code: 'a + b + c - 2',
				expr: {value: 'a + b + c - 2', type: TypeParser.TYPE_EXPRESSION},
				dependencies: [
					{code: 'a', name: 'a', exportable: false, path: []},
					{code: 'b', name: 'b', exportable: false, path: []},
					{code: 'c', name: 'c', exportable: false, path: []},
				],
				filters: [],
			};

			let result = ExpressionParser.parse(expr, {
				a: 1,
				b: 2,
				c: 3,
			});

			expect(result).to.be.equal(4);
		});

	});

	describe('split()', () => {

		it('should split multiple expressions by delimiter', () => {
			let expr = 'a, 1, "a, 1", b + 2, \'c, 3\'';
			let result = ExpressionParser.split(expr, ',');

			expect(result).to.be.eql([
				'a',
				'1',
				'"a, 1"',
				'b + 2',
				"'c, 3'",
			]);
		});

	});

});
