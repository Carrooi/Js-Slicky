import {IterableDiffer, IterableDifferFactory} from '../../../src/ChangeDetection/IterableDiffer';
import {ChangeDetectionAction} from '../../../src/constants';

import chai = require('chai');


let expect = chai.expect;

let differFactory = new IterableDifferFactory;


describe('#ChangeDetection/IterableDiffer', () => {

	describe('check()', () => {

		it('should throw an error for non iterable objects', () => {
			expect(() => {
				differFactory.create('test');
			}).to.throw(Error, 'IterableDiffer: can only watch arrays or objects, [object String] given.');
		});

		it('should not see any changes in object', () => {
			expect(differFactory.create({a: 'a'}).check()).to.be.eql(null);
		});

		it('should see update change in object', () => {
			let parameters = {a: 'a'};
			let differ = differFactory.create(parameters);

			parameters.a = 'aa';

			expect(differ.check()).to.be.eql([
				{
					property: 'a',
					action: ChangeDetectionAction.Update,
					newValue: 'aa',
					oldValue: 'a',
				},
			]);
		});

		it('should see new item in object', () => {
			let parameters = {a: 'a'};
			let differ = differFactory.create(parameters);

			parameters['b'] = 'b';

			expect(differ.check()).to.be.eql([
				{
					property: 'b',
					action: ChangeDetectionAction.Add,
					newValue: 'b',
					oldValue: undefined,
				},
			]);
		});

		it('should see removed item from object', () => {
			let parameters = {a: 'a'};
			let differ = differFactory.create(parameters);

			delete parameters.a;

			expect(differ.check()).to.be.eql([
				{
					property: 'a',
					action: ChangeDetectionAction.Remove,
					newValue: undefined,
					oldValue: 'a',
				},
			]);
		});

		it('should not see any changes in array', () => {
			expect(differFactory.create(['a']).check()).to.be.eql(null);
		});

		it('should see update change in array', () => {
			let parameters = ['a'];
			let differ = differFactory.create(parameters);

			parameters[0] = 'aa';

			expect(differ.check()).to.be.eql([
				{
					property: 0,
					action: ChangeDetectionAction.Update,
					newValue: 'aa',
					oldValue: 'a',
				},
			]);
		});

		it('should see new item in array', () => {
			let parameters = ['a'];
			let differ = differFactory.create(parameters);

			parameters.push('b');

			expect(differ.check()).to.be.eql([
				{
					property: 1,
					action: ChangeDetectionAction.Add,
					newValue: 'b',
					oldValue: undefined,
				},
			]);
		});

		it('should see removed item from array', () => {
			let parameters = ['a'];
			let differ = differFactory.create(parameters);

			parameters.splice(0, 1);

			expect(differ.check()).to.be.eql([
				{
					property: 0,
					action: ChangeDetectionAction.Remove,
					newValue: undefined,
					oldValue: 'a',
				},
			]);
		});

		it('should see injected item into array', () => {
			let parameters = ['a', 'c'];
			let differ = differFactory.create(parameters);

			parameters.splice(1, 0, 'b');

			expect(differ.check()).to.be.eql([
				{
					property: 1,
					action: ChangeDetectionAction.Update,
					newValue: 'b',
					oldValue: 'c',
				},
				{
					property: 2,
					action: ChangeDetectionAction.Add,
					newValue: 'c',
					oldValue: undefined,
				},
			]);
		});

		it('should see remove item from middle of array', () => {
			let parameters = ['a', 'c', 'b'];
			let differ = differFactory.create(parameters);

			parameters.splice(1, 1);

			expect(differ.check()).to.be.eql([
				{
					property: 2,
					action: ChangeDetectionAction.Remove,
					newValue: undefined,
					oldValue: 'b',
				},
				{
					property: 1,
					action: ChangeDetectionAction.Update,
					newValue: 'b',
					oldValue: 'c',
				},
			]);
		});

		it('should add item into middle of array with tracking function', () => {
			let trackBy = (i: number, letter: string) => {
				return letter;
			};

			let parameters = ['a', 'c'];
			let differ = differFactory.create(parameters, trackBy);

			parameters.splice(1, 0, 'b');

			expect(differ.check()).to.be.eql([
				{
					property: 1,
					action: ChangeDetectionAction.Add,
					newValue: 'b',
					oldValue: undefined,
				},
				{
					property: 2,
					action: ChangeDetectionAction.UpdateKey,
					newValue: 2,
					oldValue: 1,
				},
			]);
		});

		it('should remove item from middle of array with tracking function', () => {
			let trackBy = (i: number, letter: string) => {
				return letter;
			};

			let parameters = ['a', 'c', 'b'];
			let differ = differFactory.create(parameters, trackBy);

			parameters.splice(1, 1);

			expect(differ.check()).to.be.eql([
				{
					property: 1,
					action: ChangeDetectionAction.Remove,
					newValue: undefined,
					oldValue: 'c',
				},
				{
					property: 1,
					action: ChangeDetectionAction.UpdateKey,
					newValue: 1,
					oldValue: 2,
				},
			]);
		});

	});

});
