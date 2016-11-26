import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';
import {ExpressionDependencyType} from '../../../src/constants';

import chai = require('chai');


let expect = chai.expect;


describe('#ExpressionParser', () => {
	
	describe('parse()', () => {

		it('should parse simple expression', () => {
			let expr = ExpressionParser.parse('a');

			expect(expr).to.be.eql({
				code: 'a',
				dependencies: [
					{
						code: 'a',
						root: 'a',
						type: ExpressionDependencyType.Object,
					},
				],
				filters: [],
			});
		});

		it('should parse another simple expression', () => {
			let expr = ExpressionParser.parse('s + "-"');

			expect(expr).to.be.eql({
				code: 's + "-"',
				dependencies: [
					{
						code: 's',
						root: 's',
						type: ExpressionDependencyType.Object,
					},
				],
				filters: [],
			});
		});

		it('should parse expression with object access', () => {
			let expr = ExpressionParser.parse('a.b');

			expect(expr).to.be.eql({
				code: 'a.b',
				dependencies: [
					{
						code: 'a.b',
						root: 'a',
						type: ExpressionDependencyType.Object,
					},
				],
				filters: [],
			});
		});

		it('should parse expression with multiple inner dependencies', () => {
			let expr = ExpressionParser.parse('a.b(c["d"])("e").f[5](g(h["i"]))');

			expect(expr).to.be.eql({
				code: 'a.b(c["d"])("e").f[5](g(h["i"]))',
				dependencies: [
					{
						code: 'c["d"]',
						root: 'c',
						type: ExpressionDependencyType.Object,
					},
					{
						code: 'h["i"]',
						root: 'h',
						type: ExpressionDependencyType.Object,
					},
					{
						code: 'g(h["i"])',
						root: 'g',
						type: ExpressionDependencyType.Call,
					},
					{
						code: 'a.b(c["d"])("e").f[5](g(h["i"]))',
						root: 'a',
						type: ExpressionDependencyType.Call,
					},
				],
				filters: [],
			});
		});

		it('should include filters', () => {
			let expr = ExpressionParser.parse('a | b | c');

			expect(expr).to.be.eql({
				code: 'a',
				dependencies: [
					{
						code: 'a',
						root: 'a',
						type: ExpressionDependencyType.Object,
					},
				],
				filters: [
					{
						name: 'b',
						arguments: [],
					},
					{
						name: 'c',
						arguments: [],
					},
				],
			});
		});

		it('should include filters with arguments', () => {
			let expr = ExpressionParser.parse('a | b : "test" : 5 | c : 5 : "hello" + " " + "world" : d');

			expect(expr).to.be.eql({
				code: 'a',
				dependencies: [
					{
						code: 'a',
						root: 'a',
						type: ExpressionDependencyType.Object,
					},
					{
						code: 'd',
						root: 'd',
						type: ExpressionDependencyType.Object,
					},
				],
				filters: [
					{
						name: 'b',
						arguments: [
							{
								code: '"test"',
								dependencies: [],
								filters: [],
							},
							{
								code: '5',
								dependencies: [],
								filters: [],
							},
						],
					},
					{
						name: 'c',
						arguments: [
							{
								code: '5',
								dependencies: [],
								filters: [],
							},
							{
								code: '"hello" + " " + "world"',
								dependencies: [],
								filters: [],
							},
							{
								code: 'd',
								dependencies: [
									{
										code: 'd',
										root: 'd',
										type: ExpressionDependencyType.Object,
									},
								],
								filters: [],
							},
						],
					},
				],
			});
		});

		it('should correctly compile object keys', () => {
			let expr = ExpressionParser.parse('{key: "value"}');

			expect(expr).to.be.eql({
				code: '{key: "value"}',
				dependencies: [],
				filters: [],
			});
		});

		it('should correctly compile object keys with whitespace', () => {
			let expr = ExpressionParser.parse('{key : "value"}');

			expect(expr).to.be.eql({
				code: '{key : "value"}',
				dependencies: [],
				filters: [],
			});
		});

	});

});
