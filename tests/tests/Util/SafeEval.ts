import {SafeEval} from '../../../src/Util/SafeEval';

import chai = require('chai');


let expect = chai.expect;


describe('#Util/SafeEval', () => {

	describe('run()', () => {

		it('should run code in strict mode', () => {
			let scope = SafeEval.run('return this');

			expect(scope).to.be.eql({
				result: null,
				exports: {},
			});
		});

		it('should pass custom local variables', () => {
			let result = SafeEval.run('return a + b + c', {
				a: 1,
				b: 2,
				c: 3,
			});

			expect(result).to.be.eql({
				result: 6,
				exports: {},
			});
		});

		it('should instantiate undefined variables', () => {
			let result = SafeEval.run('return a', {}, {instantiate: ['a']});

			expect(result).to.be.eql({
				result: null,
				exports: {},
			});
		});

		it('should export local variables', () => {
			let result = SafeEval.run('l = "local"; var inner = "inner"; return a', {a: 1}, {instantiate: ['l'], exports: ['l', 'inner']});

			expect(result).to.be.eql({
				result: 1,
				exports: {l: 'local'},
			});
		});

	});

});
