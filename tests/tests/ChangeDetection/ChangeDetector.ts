import {ChangeDetector} from '../../../src/ChangeDetection/ChangeDetector';
import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';
import {Scope} from '../../../src/Util/Scope';

import chai = require('chai');


let expect = chai.expect;


describe('#ChangeDetection/ChangeDetector', () => {

	describe('check()', () => {

		it('should not notify about changes for first level variable', (done) => {
			let detector = new ChangeDetector(new Scope({
				a: 'hello',
			}));

			let called = 0;

			detector.watch(ExpressionParser.parse('a'), () => {
				called++;
			});

			detector.check();

			setTimeout(() => {
				expect(called).to.be.equal(0);
				done();
			}, 50);
		});

		it('should notify about changes in first level variable', (done) => {
			let parameters = {
				a: 'hello',
			};

			let detector = new ChangeDetector(new Scope(parameters));

			detector.watch(ExpressionParser.parse('a'), () => {
				done();
			});

			parameters['a'] = 'hello world';

			detector.check();
		});

		it('should not notify about changes in nested variable', (done) => {
			let detector = new ChangeDetector(new Scope({
				a: {b: {c: 'hello'}},
			}));

			let called = 0;

			detector.watch(ExpressionParser.parse('a.b.c'), () => {
				called++;
			});

			detector.check();

			setTimeout(() => {
				expect(called).to.be.equal(0);
				done();
			}, 50);
		});

		it('should notify about changes in nested variable', (done) => {
			let parameters = {
				a: {b: {c: 'hello'}},
			};

			let detector = new ChangeDetector(new Scope(parameters));

			detector.watch(ExpressionParser.parse('a.b.c'), () => {
				done();
			});

			parameters['a'].b.c = 'hello world';

			detector.check();
		});

		it('should not notify about changes in multi expression', (done) => {
			let detector = new ChangeDetector(new Scope({
				a: 'hello',
				b: 'moon',
			}));

			let called = 0;

			detector.watch(ExpressionParser.parse('a + " " + b'), () => {
				called++;
			});

			detector.check();

			setTimeout(() => {
				expect(called).to.be.equal(0);
				done();
			}, 50);
		});

		it('should notify about changes in multi expression', (done) => {
			var parameters = {
				a: 'hello',
				b: 'moon',
			};

			let detector = new ChangeDetector(new Scope(parameters));

			detector.watch(ExpressionParser.parse('a + " " + b'), () => {
				done();
			});

			parameters['b'] = 'world';

			detector.check();
		});

	});

	describe('disable()', () => {

		it('should disable checking for changes', (done) => {
			let parameters = {
				a: 'hello',
			};

			let detector = new ChangeDetector(new Scope(parameters));
			let called = 0;

			detector.watch(ExpressionParser.parse('a'), () => {
				called++;
			});

			detector.disable();

			parameters['a'] = 'hello world';

			detector.check();

			setTimeout(() => {
				expect(called).to.be.equal(0);
				done();
			}, 50);
		});

	});

	describe('unwatch()', () => {

		it('should stop watching changes', (done) => {
			let called = 0;
			let parameters = {
				a: 1,
			};

			let detector = new ChangeDetector(new Scope(parameters));

			let id = detector.watch(ExpressionParser.parse('a'), () => {
				called++;
			});

			parameters['a']++;

			detector.check();

			setTimeout(() => {
				expect(called).to.be.equal(1);
				parameters['a']++;

				detector.unwatch(id);
				detector.check();

				setTimeout(() => {
					expect(called).to.be.equal(1);
					done();
				}, 20);
			}, 20);
		});

	});

});
