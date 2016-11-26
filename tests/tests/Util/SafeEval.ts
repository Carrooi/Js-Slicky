import {SafeEval} from '../../../src/Util/SafeEval';

import chai = require('chai');


let expect = chai.expect;


describe('#Util/SafeEval', () => {

	describe('run()', () => {

		it('should run code in strict mode', () => {
			expect(SafeEval.run('return this')).to.be.eql(null);
		});

		it('should pass custom local variables', () => {
			expect(SafeEval.run('return a + b + c', {
				a: 1,
				b: 2,
				c: 3,
			})).to.be.eql(6);
		});

	});

});
