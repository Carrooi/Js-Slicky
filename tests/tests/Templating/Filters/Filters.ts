import {DefaultFilters} from '../../../../src/Templating/Filters/DefaultFilters';

import chai = require('chai');


let expect = chai.expect;


describe('#Templating/Filters/Filters', () => {

	describe('truncate()', () => {

		it('should not truncate short text', () => {
			expect(DefaultFilters.truncate('lorem ipsum', 50)).to.be.equal('lorem ipsum');
		});

		it('should truncate long text', () => {
			expect(DefaultFilters.truncate('lorem ipsum', 6)).to.be.equal('lorem&hellip;');
		});

	});

	describe('substr()', () => {

		it('should return substring', () => {
			expect(DefaultFilters.substr('lorem ipsum', 2, 3)).to.be.equal('rem');
		});

	});

	describe('trim()', () => {

		it('should trim text', () => {
			expect(DefaultFilters.trim('  lorem ipsum  ')).to.be.equal('lorem ipsum');
		});

	});

	describe('replace()', () => {

		it('should replace all occurrences of string', () => {
			expect(DefaultFilters.replace('lorem ipsum dolor sit amet', ' ', '+')).to.be.equal('lorem+ipsum+dolor+sit+amet');
		});

	});

	describe('join()', () => {

		it('should join list of strings', () => {
			expect(DefaultFilters.join(['lorem', 'ipsum', 'dolor'], ' ')).to.be.equal('lorem ipsum dolor');
		});

	});

	describe('lower()', () => {

		it('should lower all characters', () => {
			expect(DefaultFilters.lower('LOREM IPSUM')).to.be.equal('lorem ipsum');
		});

	});

	describe('lower()', () => {

		it('should upper all characters', () => {
			expect(DefaultFilters.upper('lorem ipsum')).to.be.equal('LOREM IPSUM');
		});

	});

	describe('firstUpper()', () => {

		it('should upper case first character', () => {
			expect(DefaultFilters.firstUpper('lorem ipsum')).to.be.equal('Lorem ipsum');
		});

	});

	describe('length()', () => {

		it('should return length of item', () => {
			expect(DefaultFilters.length('lorem ipsum')).to.be.equal(11);
		});

	});

	describe('json()', () => {

		it('should return stringified object', () => {
			expect(DefaultFilters.json({a: 1})).to.be.equal('{"a":1}');
		});

	});

});
