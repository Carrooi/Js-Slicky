import {
	TruncateFilter,
	SubstrFilter,
	TrimFilter,
	ReplaceFilter,
	JoinFilter,
	LowerFilter,
	UpperFilter,
	FirstUpperFilter,
	LengthFilter,
	JsonFilter,
} from '../../../../src/Templating/Filters/DefaultFilters';

import chai = require('chai');


let expect = chai.expect;


describe('#Templating/Filters/Filters', () => {

	describe('truncate()', () => {

		it('should not truncate short text', () => {
			expect((new TruncateFilter).transform('lorem ipsum', 50)).to.be.equal('lorem ipsum');
		});

		it('should truncate long text', () => {
			expect((new TruncateFilter).transform('lorem ipsum', 6)).to.be.equal('lorem&hellip;');
		});

	});

	describe('substr()', () => {

		it('should return substring', () => {
			expect((new SubstrFilter).transform('lorem ipsum', 2, 3)).to.be.equal('rem');
		});

	});

	describe('trim()', () => {

		it('should trim text', () => {
			expect((new TrimFilter).transform('  lorem ipsum  ')).to.be.equal('lorem ipsum');
		});

	});

	describe('replace()', () => {

		it('should replace all occurrences of string', () => {
			expect((new ReplaceFilter).transform('lorem ipsum dolor sit amet', ' ', '+')).to.be.equal('lorem+ipsum+dolor+sit+amet');
		});

	});

	describe('join()', () => {

		it('should join list of strings', () => {
			expect((new JoinFilter).transform(['lorem', 'ipsum', 'dolor'], ' ')).to.be.equal('lorem ipsum dolor');
		});

	});

	describe('lower()', () => {

		it('should lower all characters', () => {
			expect((new LowerFilter).transform('LOREM IPSUM')).to.be.equal('lorem ipsum');
		});

	});

	describe('upper()', () => {

		it('should upper all characters', () => {
			expect((new UpperFilter).transform('lorem ipsum')).to.be.equal('LOREM IPSUM');
		});

	});

	describe('firstUpper()', () => {

		it('should upper case first character', () => {
			expect((new FirstUpperFilter).transform('lorem ipsum')).to.be.equal('Lorem ipsum');
		});

	});

	describe('length()', () => {

		it('should return length of item', () => {
			expect((new LengthFilter).transform('lorem ipsum')).to.be.equal(11);
		});

	});

	describe('json()', () => {

		it('should return stringified object', () => {
			expect((new JsonFilter).transform({a: 1})).to.be.equal('{"a":1}');
		});

	});

});
