import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';

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
					},
				],
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
					},
				],
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
					},
				],
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
					},
					{
						code: 'h["i"]',
						root: 'h',
					},
					{
						code: 'g(h["i"])',
						root: 'g',
					},
					{
						code: 'a.b(c["d"])("e").f[5](g(h["i"]))',
						root: 'a',
					},
				],
			});
		});

		it('should include filters', () => {
			let expr = ExpressionParser.parse('a | b | c', {
				filterProvider: 'filter(%value, "%filter", [%args])',
			});

			expect(expr).to.be.eql({
				code: 'filter(filter(a, "b", []), "c", [])',
				dependencies: [
					{
						code: 'a',
						root: 'a',
					},
				],
			});
		});

		it('should include filters with arguments', () => {
			let expr = ExpressionParser.parse('a | b : "test" : 5 | c : 5 : "hello" + " " + "world" : d', {
				filterProvider: 'filter(%value, "%filter", [%args])',
			});

			expect(expr).to.be.eql({
				code: 'filter(filter(a, "b", ["test", 5]), "c", [5, "hello" + " " + "world", d])',
				dependencies: [
					{
						code: 'a',
						root: 'a',
					},
					{
						code: 'd',
						root: 'd',
					}
				],
			});
		});

		it('should correctly compile object keys', () => {
			let expr = ExpressionParser.parse('{key: "value"}');

			expect(expr).to.be.eql({
				code: '{key: "value"}',
				dependencies: [],
			});
		});

		it('should correctly compile object keys with whitespace', () => {
			let expr = ExpressionParser.parse('{key : "value"}');

			expect(expr).to.be.eql({
				code: '{key : "value"}',
				dependencies: [],
			});
		});

	});

});
