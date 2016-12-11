import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';

import chai = require('chai');


let expect = chai.expect;


describe('#ExpressionParser.update', () => {
	
	describe('parse()', () => {

		it('should parse simple expression', () => {
			let expr = ExpressionParser.parse('a', {
				replaceGlobalRoot: 'this.scope.%root',
			});

			expect(expr).to.be.eql('this.scope.a');
		});

		it('should parse simple expression and not update local variable', () => {
			let expr = ExpressionParser.parse('a + $local', {
				replaceGlobalRoot: 'this.scope.%root',
			});

			expect(expr).to.be.eql('this.scope.a + $local');
		});

		it('should correctly update compile object with keys', () => {
			let expr = ExpressionParser.parse('{one: first, two: second}', {
				replaceGlobalRoot: 'this.scope.%root',
			});

			expect(expr).to.be.eql('{one: this.scope.first, two: this.scope.second}');
		});

		it('should parse another simple expression', () => {
			let expr = ExpressionParser.parse('s + "-"', {
				replaceGlobalRoot: 'this.scope.%root',
			});

			expect(expr).to.be.eql('this.scope.s + "-"');
		});

		it('should parse expression with object access', () => {
			let expr = ExpressionParser.parse('a.b', {
				replaceGlobalRoot: 'this.scope.%root',
			});

			expect(expr).to.be.eql('this.scope.a.b');
		});

		it('should parse expression with multiple inner dependencies', () => {
			let expr = ExpressionParser.parse('a.b(c["d"])("e").f[5](g(h["i"]))', {
				replaceGlobalRoot: 'this.scope.%root',
			});

			expect(expr).to.be.eql('this.scope.a.b(this.scope.c["d"])("e").f[5](this.scope.g(this.scope.h["i"]))');
		});

		it('should include filters', () => {
			let expr = ExpressionParser.parse('a | b | c', {
				replaceGlobalRoot: 'param("%root")',
				filterProvider: 'filter(%value, "%filter", [%args])',
			});

			expect(expr).to.be.eql('filter(filter(param("a"), "b", []), "c", [])');
		});

		it('should include filters with arguments', () => {
			let expr = ExpressionParser.parse('a | b : "test" : 5 | c : 5 : "hello" + " " + "world" : d', {
				replaceGlobalRoot: 'param("%root")',
				filterProvider: 'filter(%value, "%filter", [%args])',
			});

			expect(expr).to.be.eql('filter(filter(param("a"), "b", ["test", 5]), "c", [5, "hello" + " " + "world", param("d")])');
		});

	});

});
