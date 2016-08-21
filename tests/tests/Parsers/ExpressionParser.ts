import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';
import {ExpressionCallType, ExpressionDependencyType} from '../../../src/constants';

import chai = require('chai');


let expect = chai.expect;


describe('#ExpressionParser', () => {
	
	describe('parse()', () => {

		it('should parse simple expression', () => {
			let expr = ExpressionParser.parse('a');

			expect(expr).to.be.eql({
				code: 'a',
				callType: ExpressionCallType.Static,
				dependencies: [
					{
						code: 'a',
						root: 'a',
						type: ExpressionDependencyType.Object,
						exportable: false,
					},
				],
				filters: [],
			});
		});

		it('should parse another simple expression', () => {
			let expr = ExpressionParser.parse('s + "-"');

			expect(expr).to.be.eql({
				code: 's + "-"',
				callType: ExpressionCallType.Static,
				dependencies: [
					{
						code: 's',
						root: 's',
						type: ExpressionDependencyType.Object,
						exportable: false,
					},
				],
				filters: [],
			});
		});

		it('should parse expression with exportable variable', () => {
			let expr = ExpressionParser.parse('#a = 5');

			expect(expr).to.be.eql({
				code: 'a = 5',
				callType: ExpressionCallType.Static,
				dependencies: [
					{
						code: 'a',
						root: 'a',
						type: ExpressionDependencyType.Object,
						exportable: true,
					},
				],
				filters: [],
			});
		});

		it('should parse expression with many exportable variables', () => {
			let expr = ExpressionParser.parse('#b = a && #c = b');

			expect(expr).to.be.eql({
				code: 'b = a && c = b',
				callType: ExpressionCallType.Static,
				dependencies: [
					{
						code: 'b',
						root: 'b',
						type: ExpressionDependencyType.Object,
						exportable: true,
					},
					{
						code: 'a',
						root: 'a',
						type: ExpressionDependencyType.Object,
						exportable: false,
					},
					{
						code: 'c',
						root: 'c',
						type: ExpressionDependencyType.Object,
						exportable: true,
					},
				],
				filters: [],
			});
		});

		it('should parse expression with object access', () => {
			let expr = ExpressionParser.parse('a.b');

			expect(expr).to.be.eql({
				code: 'a.b',
				callType: ExpressionCallType.Static,
				dependencies: [
					{
						code: 'a.b',
						root: 'a',
						type: ExpressionDependencyType.Object,
						exportable: false,
					},
				],
				filters: [],
			});
		});

		it('should parse expression with multiple inner dependencies', () => {
			let expr = ExpressionParser.parse('a.b(c["d"])("e").f[5](g(h["i"]))');

			expect(expr).to.be.eql({
				code: 'a.b(c["d"])("e").f[5](g(h["i"]))',
				callType: ExpressionCallType.Dynamic,
				dependencies: [
					{
						code: 'c["d"]',
						root: 'c',
						type: ExpressionDependencyType.Object,
						exportable: false,
					},
					{
						code: 'h["i"]',
						root: 'h',
						type: ExpressionDependencyType.Object,
						exportable: false,
					},
					{
						code: 'g(h["i"])',
						root: 'g',
						type: ExpressionDependencyType.Call,
						exportable: false,
					},
					{
						code: 'a.b(c["d"])("e").f[5](g(h["i"]))',
						root: 'a',
						type: ExpressionDependencyType.Call,
						exportable: false,
					},
				],
				filters: [],
			});
		});

		it('should include filters', () => {
			let expr = ExpressionParser.parse('a | b | c');

			expect(expr).to.be.eql({
				code: 'a',
				callType: ExpressionCallType.Static,
				dependencies: [
					{
						code: 'a',
						root: 'a',
						type: ExpressionDependencyType.Object,
						exportable: false,
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
				callType: ExpressionCallType.Static,
				dependencies: [
					{
						code: 'a',
						root: 'a',
						type: ExpressionDependencyType.Object,
						exportable: false,
					},
					{
						code: 'd',
						root: 'd',
						type: ExpressionDependencyType.Object,
						exportable: false,
					},
				],
				filters: [
					{
						name: 'b',
						arguments: [
							{
								code: '"test"',
								callType: ExpressionCallType.Static,
								dependencies: [],
								filters: [],
							},
							{
								code: '5',
								callType: ExpressionCallType.Static,
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
								callType: ExpressionCallType.Static,
								dependencies: [],
								filters: [],
							},
							{
								code: '"hello" + " " + "world"',
								callType: ExpressionCallType.Static,
								dependencies: [],
								filters: [],
							},
							{
								code: 'd',
								callType: ExpressionCallType.Static,
								dependencies: [
									{
										code: 'd',
										root: 'd',
										type: ExpressionDependencyType.Object,
										exportable: false,
									},
								],
								filters: [],
							},
						],
					},
				],
			});
		});

	});

});
