import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';
import {ExpressionDependencyType} from '../../../src/constants';

import chai = require('chai');


let expect = chai.expect;


describe('#ExpressionParser.update', () => {
	
	describe('parse()', () => {

		it('should parse simple expression', () => {
			let expr = ExpressionParser.parse('a', {
				replaceGlobalRoot: 'this.scope.%root',
			});

			expect(expr).to.be.eql({
				code: 'this.scope.a',
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

		it('should parse simple expression and not update local variable', () => {
			let expr = ExpressionParser.parse('a + $local', {
				replaceGlobalRoot: 'this.scope.%root',
			});

			expect(expr).to.be.eql({
				code: 'this.scope.a + $local',
				dependencies: [
					{
						code: 'a',
						root: 'a',
						type: ExpressionDependencyType.Object,
					},
					{
						code: '$local',
						root: '$local',
						type: ExpressionDependencyType.Object,
					},
				],
				filters: [],
			});
		});

		it('should correctly update compile object with keys', () => {
			let expr = ExpressionParser.parse('{one: first, two: second}', {
				replaceGlobalRoot: 'this.scope.%root',
			});

			console.log(expr);

			expect(expr).to.be.eql({
				code: '{one: this.scope.first, two: this.scope.second}',
				dependencies: [
					{
						code: 'first',
						root: 'first',
						type: ExpressionDependencyType.Object,
					},
					{
						code: 'second',
						root: 'second',
						type: ExpressionDependencyType.Object,
					},
				],
				filters: [],
			});
		});

		it('should parse another simple expression', () => {
			let expr = ExpressionParser.parse('s + "-"', {
				replaceGlobalRoot: 'this.scope.%root',
			});

			expect(expr).to.be.eql({
				code: 'this.scope.s + "-"',
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
			let expr = ExpressionParser.parse('a.b', {
				replaceGlobalRoot: 'this.scope.%root',
			});

			expect(expr).to.be.eql({
				code: 'this.scope.a.b',
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
			let expr = ExpressionParser.parse('a.b(c["d"])("e").f[5](g(h["i"]))', {
				replaceGlobalRoot: 'this.scope.%root',
			});

			expect(expr).to.be.eql({
				code: 'this.scope.a.b(this.scope.c["d"])("e").f[5](this.scope.g(this.scope.h["i"]))',
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
						code: 'g(this.scope.h["i"])',
						root: 'g',
						type: ExpressionDependencyType.Call,
					},
					{
						code: 'a.b(this.scope.c["d"])("e").f[5](this.scope.g(this.scope.h["i"]))',
						root: 'a',
						type: ExpressionDependencyType.Call,
					},
				],
				filters: [],
			});
		});

		it('should include filters', () => {
			let expr = ExpressionParser.parse('a | b | c', {
				replaceGlobalRoot: 'this.scope.%root',
			});

			expect(expr).to.be.eql({
				code: 'this.scope.a',
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
			let expr = ExpressionParser.parse('a | b : "test" : 5 | c : 5 : "hello" + " " + "world" : d', {
				replaceGlobalRoot: 'this.scope.%root',
			});

			expect(expr).to.be.eql({
				code: 'this.scope.a',
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
								code: 'this.scope.d',
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

	});

});
