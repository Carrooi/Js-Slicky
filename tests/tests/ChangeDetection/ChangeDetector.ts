import {ChangeDetector} from '../../../src/ChangeDetection/ChangeDetector';
import {ChangeDetectionAction} from '../../../src/ChangeDetection/constants';
import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';
import {ChangedItem} from '../../../src/Interfaces';

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

		it('should disable checking for changes', (done) => {
			let parameters = {
				a: 'hello',
			};

			let detector = new ChangeDetector(parameters);
			let called = 0;

			detector.watch(ExpressionParser.precompile('a'), () => {
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

		it('should notify about changes in first level variable', (done) => {
			let parameters = {
				a: 'hello',
			};

			let detector = new ChangeDetector(parameters);

			detector.watch(ExpressionParser.precompile('a'), (changed: ChangedItem) => {
				expect(changed.action).to.be.equal(ChangeDetectionAction.DeepUpdate);
				expect(changed.dependencies).to.have.length(1);

				expect(changed.dependencies[0].action).to.be.equal(ChangeDetectionAction.Update);
				expect(changed.dependencies[0].expr.code).to.be.equal('a');

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

			detector.watch(ExpressionParser.precompile('a.b.c'), (changed: ChangedItem) => {
				expect(changed.action).to.be.equal(ChangeDetectionAction.DeepUpdate);
				expect(changed.dependencies).to.have.length(1);

				expect(changed.dependencies[0].action).to.be.equal(ChangeDetectionAction.Update);
				expect(changed.dependencies[0].expr.code).to.be.equal('a.b.c');

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

			detector.watch(ExpressionParser.precompile('a + " " + b'), (changed: ChangedItem) => {
				expect(changed.action).to.be.equal(ChangeDetectionAction.DeepUpdate);
				expect(changed.dependencies).to.have.length(1);

				expect(changed.dependencies[0].action).to.be.equal(ChangeDetectionAction.Update);
				expect(changed.dependencies[0].expr.code).to.be.equal('b');

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

			detector.watch(ExpressionParser.precompile('a'), (changed: ChangedItem) => {
				expect(changed.action).to.be.equal(ChangeDetectionAction.DeepUpdate);
				expect(changed.dependencies).to.have.length(1);

				expect(changed.dependencies[0].action).to.be.equal(ChangeDetectionAction.DeepUpdate);
				expect(changed.dependencies[0].expr.code).to.be.equal('a');

				expect(changed.dependencies[0].props).to.have.length(1);
				expect(changed.dependencies[0].props[0].action).to.be.equal(ChangeDetectionAction.Add);
				expect(changed.dependencies[0].props[0].property).to.be.equal('b');
				expect(changed.dependencies[0].props[0].newValue).to.be.equal('world');
				expect(changed.dependencies[0].props[0].oldValue).to.be.equal(undefined);

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

			detector.watch(ExpressionParser.precompile('a'), (changed: ChangedItem) => {
				expect(changed.action).to.be.equal(ChangeDetectionAction.DeepUpdate);
				expect(changed.dependencies).to.have.length(1);

				expect(changed.dependencies[0].action).to.be.equal(ChangeDetectionAction.DeepUpdate);
				expect(changed.dependencies[0].expr.code).to.be.equal('a');

				expect(changed.dependencies[0].props).to.have.length(1);
				expect(changed.dependencies[0].props[0].action).to.be.equal(ChangeDetectionAction.Update);
				expect(changed.dependencies[0].props[0].property).to.be.equal('b');
				expect(changed.dependencies[0].props[0].newValue).to.be.equal('world');
				expect(changed.dependencies[0].props[0].oldValue).to.be.equal('moon');

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

			detector.watch(ExpressionParser.precompile('a'), (changed: ChangedItem) => {
				expect(changed.action).to.be.equal(ChangeDetectionAction.DeepUpdate);
				expect(changed.dependencies).to.have.length(1);

				expect(changed.dependencies[0].action).to.be.equal(ChangeDetectionAction.DeepUpdate);
				expect(changed.dependencies[0].expr.code).to.be.equal('a');

				expect(changed.dependencies[0].props).to.have.length(1);
				expect(changed.dependencies[0].props[0].action).to.be.equal(ChangeDetectionAction.Remove);
				expect(changed.dependencies[0].props[0].property).to.be.equal('b');
				expect(changed.dependencies[0].props[0].newValue).to.be.equal(undefined);
				expect(changed.dependencies[0].props[0].oldValue).to.be.equal('world');

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

			detector.watch(ExpressionParser.precompile('a'), (changed: ChangedItem) => {
				expect(changed.action).to.be.equal(ChangeDetectionAction.DeepUpdate);
				expect(changed.dependencies).to.have.length(1);

				expect(changed.dependencies[0].action).to.be.equal(ChangeDetectionAction.DeepUpdate);
				expect(changed.dependencies[0].expr.code).to.be.equal('a');

				expect(changed.dependencies[0].props).to.have.length(1);
				expect(changed.dependencies[0].props[0].action).to.be.equal(ChangeDetectionAction.Add);
				expect(changed.dependencies[0].props[0].property).to.be.equal(1);
				expect(changed.dependencies[0].props[0].newValue).to.be.equal('world');
				expect(changed.dependencies[0].props[0].oldValue).to.be.equal(undefined);

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

			detector.watch(ExpressionParser.precompile('a'), (changed: ChangedItem) => {
				expect(changed.action).to.be.equal(ChangeDetectionAction.DeepUpdate);
				expect(changed.dependencies).to.have.length(1);

				expect(changed.dependencies[0].action).to.be.equal(ChangeDetectionAction.DeepUpdate);
				expect(changed.dependencies[0].expr.code).to.be.equal('a');

				expect(changed.dependencies[0].props).to.have.length(1);
				expect(changed.dependencies[0].props[0].action).to.be.equal(ChangeDetectionAction.Update);
				expect(changed.dependencies[0].props[0].property).to.be.equal(1);
				expect(changed.dependencies[0].props[0].newValue).to.be.equal('world');
				expect(changed.dependencies[0].props[0].oldValue).to.be.equal('moon');

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

			detector.watch(ExpressionParser.precompile('a'), (changed: ChangedItem) => {
				expect(changed.action).to.be.equal(ChangeDetectionAction.DeepUpdate);
				expect(changed.dependencies).to.have.length(1);

				expect(changed.dependencies[0].action).to.be.equal(ChangeDetectionAction.DeepUpdate);
				expect(changed.dependencies[0].expr.code).to.be.equal('a');

				expect(changed.dependencies[0].props).to.have.length(1);
				expect(changed.dependencies[0].props[0].action).to.be.equal(ChangeDetectionAction.Remove);
				expect(changed.dependencies[0].props[0].property).to.be.equal(1);
				expect(changed.dependencies[0].props[0].newValue).to.be.equal(undefined);
				expect(changed.dependencies[0].props[0].oldValue).to.be.equal('world');

				done();
			});

			parameters['a'].splice(1, 1);

			detector.check();
		});

	});

});
