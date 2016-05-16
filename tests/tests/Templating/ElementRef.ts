import {ElementRef} from '../../../src/Templating/ElementRef';

import chai = require('chai');


let expect = chai.expect;


describe('#Templating/ElementRef', () => {

	describe('isType()', () => {

		it('should return true if node is of type', () => {
			let el = document.createComment('hello');
			let ref = new ElementRef(el);

			expect(ref.isType(Node.COMMENT_NODE)).to.be.equal(true);
		});

		it('should return false if node is not of type', () => {
			let el = document.createComment('hello');
			let ref = new ElementRef(el);

			expect(ref.isType(Node.ELEMENT_NODE)).to.be.equal(false);
		});

	});

	describe('isElement()', () => {

		it('should return true when checked string is same as nodeName', () => {
			let el = document.createElement('img');
			let ref = new ElementRef(el);

			expect(ref.isElement('img')).to.be.equal(true);
		});

		it('should return false when checked string is not same as nodeName', () => {
			let el = document.createElement('div');
			let ref = new ElementRef(el);

			expect(ref.isElement('img')).to.be.equal(false);
		});

		it('should return true when checked array contains nodeName', () => {
			let el = document.createElement('span');
			let ref = new ElementRef(el);

			expect(ref.isElement(['img', 'span', 'div'])).to.be.equal(true);
		});

		it('should return false when checked array does not contain nodeName', () => {
			let el = document.createElement('b');
			let ref = new ElementRef(el);

			expect(ref.isElement(['img', 'span', 'div'])).to.be.equal(false);
		});

	});

});
