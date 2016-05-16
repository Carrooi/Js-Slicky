import {Dom} from '../../../src/Util/Dom';

import chai = require('chai');


let expect = chai.expect;


describe('#Util/Dom', () => {

	describe('hasCssClass()', () => {

		it('should return true when class exists', () => {
			let el = document.createElement('div');
			el.className = 'test1 test2 test3';

			expect(Dom.hasCssClass(el, 'test2')).to.be.equal(true);
		});

		it('should return false when class does not exists', () => {
			let el = document.createElement('div');
			el.className = 'test1 test2 test3';

			expect(Dom.hasCssClass(el, 'test')).to.be.equal(false);
		});

	});

	describe('addCssClass()', () => {

		it('should add new class', () => {
			let el = document.createElement('div');
			el.className = 'test1 test2 test3';

			Dom.addCssClass(el, 'test4');

			expect(el.className).to.be.equal('test1 test2 test3 test4');
		});

		it('should not add a class when its already exists', () => {
			let el = document.createElement('div');
			el.className = 'test1 test2 test3';

			Dom.addCssClass(el, 'test2');

			expect(el.className).to.be.equal('test1 test2 test3');
		});

	});

	describe('removeCssClass()', () => {

		it('should remove existing class', () => {
			let el = document.createElement('div');
			el.className = 'test1 test2 test3';

			Dom.removeCssClass(el, 'test2');

			expect(el.className).to.be.equal('test1 test3');
		});

	});

	describe('insertBefore()', () => {

		it('should insert element before another element', () => {
			let parent = document.createElement('div');
			parent.innerHTML = '<span>2</span>';

			let el = document.createElement('span');
			el.innerText = '1';

			Dom.insertBefore(el, parent.children[0]);

			expect(parent.innerHTML).to.be.equal('<span>1</span><span>2</span>');
		});

	});

	describe('insertAfter()', () => {

		it('should insert element between two elements', () => {
			let parent = document.createElement('div');
			parent.innerHTML = '<span>1</span><span>3</span>';

			let el = document.createElement('span');
			el.innerText = '2';

			Dom.insertAfter(el, parent.children[0]);

			expect(parent.innerHTML).to.be.equal('<span>1</span><span>2</span><span>3</span>');
		});

		it('should insert element at the end of parent element', () => {
			let parent = document.createElement('div');
			parent.innerHTML = '<span>1</span>';

			let el = document.createElement('span');
			el.innerText = '2';

			Dom.insertAfter(el, parent.children[0]);

			expect(parent.innerHTML).to.be.equal('<span>1</span><span>2</span>');
		});

	});

	describe('getReadableName()', () => {

		it('should get readable name for simple element', () => {
			let el = document.createElement('span');
			expect(Dom.getReadableName(el)).to.be.equal('span');
		});

		it('should get readable name for element with id', () => {
			let el = document.createElement('span');
			el.id = 'text';

			expect(Dom.getReadableName(el)).to.be.equal('span#text');
		});

		it('should get readable name for element with classes', () => {
			let el = document.createElement('span');
			el.className = 'success danger info';

			expect(Dom.getReadableName(el)).to.be.equal('span.success.danger.info');
		});

		it('should get readable name for element with id and classes', () => {
			let el = document.createElement('span');
			el.id = 'text';
			el.className = 'success danger info';

			expect(Dom.getReadableName(el)).to.be.equal('span#text.success.danger.info');
		});

	});

});
