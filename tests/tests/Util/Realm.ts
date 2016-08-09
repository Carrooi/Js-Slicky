import {Realm} from '../../../utils';

import chai = require('chai');


let expect = chai.expect;


describe('#Realm', () => {

	describe('run()', () => {

		it('should run task', (done) => {
			let sequence = [];

			let realm = new Realm(null, () => {
				sequence.push('enter');
			}, () => {
				sequence.push('leave');
			});

			let result = realm.run(() => {
				setTimeout(() => {
					sequence.push('timeout 1');
				}, 10);
				setTimeout(() => {
					sequence.push('timeout 2');
				}, 20);

				return 'result of run';
			});

			expect(result).to.be.equal('result of run');

			setTimeout(() => {
				expect(sequence).to.be.eql(['enter', 'timeout 1', 'leave', 'enter', 'timeout 2', 'leave']);
				done();
			}, 50);
		});
		
	});

});
