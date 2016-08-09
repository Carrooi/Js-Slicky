import {ChangeDetector} from '../../../src/ChangeDetection/ChangeDetector';
import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';

import chai = require('chai');


let expect = chai.expect;


describe('#ChangeDetection/ChangeDetector', () => {

	describe('check()', () => {

		it('should not notify about changes for first level variable', (done) => {
			let detector = new ChangeDetector({
				a: 'hello',
			});

			let called = 0;

			detector.watch(ExpressionParser.precompile('a'), () => {
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

			let detector = new ChangeDetector(parameters);

			detector.watch(ExpressionParser.precompile('a'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a',
					props: null,
				}]);

				done();
			});

			parameters['a'] = 'hello world';

			detector.check();
		});

		it('should not notify about changes in nested variable', (done) => {
			let detector = new ChangeDetector({
				a: {b: {c: 'hello'}},
			});

			let called = 0;

			detector.watch(ExpressionParser.precompile('a.b.c'), () => {
				called++;
			});

			detector.check();

			setTimeout(() => {
				expect(called).to.be.equal(0);
				done();
			}, 50);
		});

		it('should notify about changes in nested variable', (done) => {
			var parameters = {
				a: {b: {c: 'hello'}},
			};

			let detector = new ChangeDetector(parameters);

			detector.watch(ExpressionParser.precompile('a.b.c'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a.b.c',
					props: null,
				}]);

				done();
			});

			parameters['a'].b.c = 'hello world';

			detector.check();
		});

		it('should not notify about changes in multi expression', (done) => {
			let detector = new ChangeDetector({
				a: 'hello',
				b: 'moon',
			});

			let called = 0;

			detector.watch(ExpressionParser.precompile('a + " " + b'), () => {
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

			let detector = new ChangeDetector(parameters);

			detector.watch(ExpressionParser.precompile('a + " " + b'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'b',
					props: null,
				}]);

				done();
			});

			parameters['b'] = 'world';

			detector.check();
		});

		it('should notify about changes when adding new element to an object', (done) => {
			var parameters = {
				a: {a: 'hello'},
			};

			let detector = new ChangeDetector(parameters);

			detector.watch(ExpressionParser.precompile('a'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a',
					props: [{
						prop: 'b',
						action: 'add',
						newValue: 'world',
						oldValue: undefined,
					}],
				}]);

				done();
			});

			parameters['a']['b'] = 'world';

			detector.check();
		});

		it('should notify about changes when changing an element in object', (done) => {
			var parameters = {
				a: {a: 'hello', b: 'moon'},
			};

			let detector = new ChangeDetector(parameters);

			detector.watch(ExpressionParser.precompile('a'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a',
					props: [{
						prop: 'b',
						action: 'change',
						newValue: 'world',
						oldValue: 'moon',
					}],
				}]);

				done();
			});

			parameters['a'].b = 'world';

			detector.check();
		});

		it('should notify about changes when removing an element from object', (done) => {
			var parameters = {
				a: {a: 'hello', b: 'world'},
			};

			let detector = new ChangeDetector(parameters);

			detector.watch(ExpressionParser.precompile('a'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a',
					props: [{
						prop: 'b',
						action: 'remove',
						newValue: undefined,
						oldValue: 'world',
					}],
				}]);

				done();
			});

			delete parameters['a'].b;

			detector.check();
		});

		it('should notify about changes when adding new element to an array', (done) => {
			var parameters = {
				a: ['hello'],
			};

			let detector = new ChangeDetector(parameters);

			detector.watch(ExpressionParser.precompile('a'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a',
					props: [{
						prop: 1,
						action: 'add',
						newValue: 'world',
						oldValue: undefined,
					}],
				}]);

				done();
			});

			parameters['a'].push('world');

			detector.check();
		});

		it('should notify about changes when changing an element in array', (done) => {
			var parameters = {
				a: ['hello', 'moon'],
			};

			let detector = new ChangeDetector(parameters);

			detector.watch(ExpressionParser.precompile('a'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a',
					props: [{
						prop: 1,
						action: 'change',
						newValue: 'world',
						oldValue: 'moon',
					}],
				}]);

				done();
			});

			parameters['a'][1] = 'world';

			detector.check();
		});

		it('should notify about changes when removing an element from array', (done) => {
			var parameters = {
				a: ['hello', 'world'],
			};

			let detector = new ChangeDetector(parameters);

			detector.watch(ExpressionParser.precompile('a'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a',
					props: [{
						prop: 1,
						action: 'remove',
						newValue: undefined,
						oldValue: 'world',
					}],
				}]);

				done();
			});

			parameters['a'].splice(1, 1);

			detector.check();
		});

	});

});
