import {Watcher} from '../../../src/Util/Watcher';
import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';

import chai = require('chai');


let expect = chai.expect;


describe('#Util/Watcher', () => {

	describe('check()', () => {

		it('should not notify about changes for first level variable', (done) => {
			let watcher = new Watcher({
				a: 'hello',
			});

			let called = 0;

			watcher.watch(ExpressionParser.precompile('a'), () => {
				called++;
			});

			watcher.check();

			setTimeout(() => {
				expect(called).to.be.equal(0);
				done();
			}, 50);
		});

		it('should notify about changes in first level variable', (done) => {
			let parameters = {
				a: 'hello',
			};

			let watcher = new Watcher(parameters);

			let called = 0;

			watcher.watch(ExpressionParser.precompile('a'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a',
					props: null,
				}]);

				called++;
			});

			parameters['a'] = 'hello world';

			watcher.check();

			setTimeout(() => {
				expect(called).to.be.equal(1);
				done();
			}, 50);
		});

		it('should not notify about changes in nested variable', (done) => {
			let watcher = new Watcher({
				a: {b: {c: 'hello'}},
			});

			let called = 0;

			watcher.watch(ExpressionParser.precompile('a.b.c'), () => {
				called++;
			});

			watcher.check();

			setTimeout(() => {
				expect(called).to.be.equal(0);
				done();
			}, 50);
		});

		it('should notify about changes in nested variable', (done) => {
			var parameters = {
				a: {b: {c: 'hello'}},
			};

			let watcher = new Watcher(parameters);

			let called = 0;

			watcher.watch(ExpressionParser.precompile('a.b.c'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a.b.c',
					props: null,
				}]);

				called++;
			});

			parameters['a'].b.c = 'hello world';

			watcher.check();

			setTimeout(() => {
				expect(called).to.be.equal(1);
				done();
			}, 50);
		});

		it('should not notify about changes in multi expression', (done) => {
			let watcher = new Watcher({
				a: 'hello',
				b: 'moon',
			});

			let called = 0;

			watcher.watch(ExpressionParser.precompile('a + " " + b'), () => {
				called++;
			});

			watcher.check();

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

			let watcher = new Watcher(parameters);

			let called = 0;

			watcher.watch(ExpressionParser.precompile('a + " " + b'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'b',
					props: null,
				}]);

				called++;
			});

			parameters['b'] = 'world';

			watcher.check();

			setTimeout(() => {
				expect(called).to.be.equal(1);
				done();
			}, 50);
		});

		it('should notify about changes when adding new element to an object', (done) => {
			var parameters = {
				a: {a: 'hello'},
			};

			let watcher = new Watcher(parameters);

			let called = 0;

			watcher.watch(ExpressionParser.precompile('a'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a',
					props: [{
						prop: 'b',
						action: 'add',
						newValue: 'world',
						oldValue: undefined,
					}],
				}]);

				called++;
			});

			parameters['a']['b'] = 'world';

			watcher.check();

			setTimeout(() => {
				expect(called).to.be.equal(1);
				done();
			}, 50);
		});

		it('should notify about changes when changing an element in object', (done) => {
			var parameters = {
				a: {a: 'hello', b: 'moon'},
			};

			let watcher = new Watcher(parameters);

			let called = 0;

			watcher.watch(ExpressionParser.precompile('a'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a',
					props: [{
						prop: 'b',
						action: 'change',
						newValue: 'world',
						oldValue: 'moon',
					}],
				}]);

				called++;
			});

			parameters['a'].b = 'world';

			watcher.check();

			setTimeout(() => {
				expect(called).to.be.equal(1);
				done();
			}, 50);
		});

		it('should notify about changes when removing an element from object', (done) => {
			var parameters = {
				a: {a: 'hello', b: 'world'},
			};

			let watcher = new Watcher(parameters);

			let called = 0;

			watcher.watch(ExpressionParser.precompile('a'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a',
					props: [{
						prop: 'b',
						action: 'remove',
						newValue: undefined,
						oldValue: 'world',
					}],
				}]);

				called++;
			});

			delete parameters['a'].b;

			watcher.check();

			setTimeout(() => {
				expect(called).to.be.equal(1);
				done();
			}, 50);
		});

		it('should notify about changes when adding new element to an array', (done) => {
			var parameters = {
				a: ['hello'],
			};

			let watcher = new Watcher(parameters);

			let called = 0;

			watcher.watch(ExpressionParser.precompile('a'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a',
					props: [{
						prop: 1,
						action: 'add',
						newValue: 'world',
						oldValue: undefined,
					}],
				}]);

				called++;
			});

			parameters['a'].push('world');

			watcher.check();

			setTimeout(() => {
				expect(called).to.be.equal(1);
				done();
			}, 50);
		});

		it('should notify about changes when changing an element in array', (done) => {
			var parameters = {
				a: ['hello', 'moon'],
			};

			let watcher = new Watcher(parameters);

			let called = 0;

			watcher.watch(ExpressionParser.precompile('a'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a',
					props: [{
						prop: 1,
						action: 'change',
						newValue: 'world',
						oldValue: 'moon',
					}],
				}]);

				called++;
			});

			parameters['a'][1] = 'world';

			watcher.check();

			setTimeout(() => {
				expect(called).to.be.equal(1);
				done();
			}, 50);
		});

		it('should notify about changes when removing an element from array', (done) => {
			var parameters = {
				a: ['hello', 'world'],
			};

			let watcher = new Watcher(parameters);

			let called = 0;

			watcher.watch(ExpressionParser.precompile('a'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a',
					props: [{
						prop: 1,
						action: 'remove',
						newValue: undefined,
						oldValue: 'world',
					}],
				}]);

				called++;
			});

			parameters['a'].splice(1, 1);

			watcher.check();

			setTimeout(() => {
				expect(called).to.be.equal(1);
				done();
			}, 50);
		});

	});

	describe('run()', () => {

		it('should not see any changes in simple variable', (done) => {
			let watcher = new Watcher({
				a: 'hello',
			});

			let called = 0;

			watcher.watch(ExpressionParser.precompile('a'), () => {
				called++;
			});

			watcher.run();

			setTimeout(() => {
				expect(called).to.be.equal(0);
				done();
			}, 200);
		});

		it('should watch for changes in first level variable', (done) => {
			var parameters = {
				a: 'hello',
			};

			let watcher = new Watcher(parameters);

			let called = 0;

			watcher.watch(ExpressionParser.precompile('a'), (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a',
					props: null,
				}]);

				called++;
			});

			watcher.run();

			setTimeout(() => {
				expect(called).to.be.equal(0);

				parameters['a'] = 'hello world';

				setTimeout(() => {
					expect(called).to.be.equal(1);
					done();
				}, 100);
			}, 100);
		});

	});

});
