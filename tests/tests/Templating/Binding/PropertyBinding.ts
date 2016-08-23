import {Application, Compiler, ComponentView, ElementRef} from '../../../../core';
import {Container} from '../../../../di';
import {Dom} from '../../../../utils';
import {PropertyBinding} from '../../../../src/Templating/Binding/PropertyBinding';
import {ExpressionParser} from '../../../../src/Parsers/ExpressionParser';

import chai = require('chai');


let expect = chai.expect;

let container: Container = null;
let application: Application = null;
let compiler: Compiler = null;


describe('#Templating/Binding/PropertyBinding', () => {

	beforeEach(() => {
		container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	describe('bind()', () => {

		it("should bind simple value to element's property", () => {
			let el = Dom.el('<div [test]="hello"></div>');

			expect(el['test']).to.be.equal(undefined);

			let view = new ComponentView(container, new ElementRef(el), null, {
				hello: 'good day',
			});

			let binding = new PropertyBinding(el, 'test');
			view.attachBinding(binding, true, ExpressionParser.parse('hello'));

			expect(el['test']).to.be.equal('good day');
		});

		it("should bind nested value to element's property", () => {
			let el = Dom.el('<div [test]="obj.greetings[0]"></div>');

			expect(el['test']).to.be.equal(undefined);

			let view = new ComponentView(container, new ElementRef(el), null, {
				obj: {
					greetings: ['good day'],
				},
			});

			let binding = new PropertyBinding(el, 'test');
			view.attachBinding(binding, true, ExpressionParser.parse('obj.greetings[0]'));

			expect(el['test']).to.be.equal('good day');
		});

		it("should bind result of expression to element's property", () => {
			let el = Dom.el('<div [test]="a + b + c"></div>');

			expect(el['test']).to.be.equal(undefined);

			let view = new ComponentView(container, new ElementRef(el), null, {
				a: 1,
				b: 2,
				c: 3,
			});

			let binding = new PropertyBinding(el, 'test');
			view.attachBinding(binding, true, ExpressionParser.parse('a + b + c'));

			expect(el['test']).to.be.equal(6);
		});

		it("should bind value to element's inner html", () => {
			let el = Dom.el('<div [innerHTML]="hello"></div>');

			let view = new ComponentView(container, new ElementRef(el), null, {
				hello: 'good day',
			});

			let binding = new PropertyBinding(el, 'innerHTML');
			view.attachBinding(binding, true, ExpressionParser.parse('hello'));

			expect(el.innerHTML).to.be.equal('good day');
		});

		it('should bind style to element', () => {
			let el = Dom.el('<div [style.border]="border"></div>');

			expect(el.style.border).to.be.equal('');

			let view = new ComponentView(container, new ElementRef(el), null, {
				border: '1px solid red',
			});

			let binding = new PropertyBinding(el, 'style.border');
			view.attachBinding(binding, true, ExpressionParser.parse('border'));

			expect(el.style.border).to.be.equal('1px solid red');
		});

		it('should remove style from element', () => {
			let el = Dom.el('<div [style.border]="border" style="border: 1px solid red;"></div>');

			expect(el.style.border).to.be.equal('1px solid red');

			let view = new ComponentView(container, new ElementRef(el), null, {
				border: false,
			});

			let binding = new PropertyBinding(el, 'style.border');
			view.attachBinding(binding, true, ExpressionParser.parse('border'));

			expect(el.style.border).to.be.equal('');
		});

		it('should bind css class to element', () => {
			let el = Dom.el('<div [class.alert]="hasAlert"></div>');

			expect(el.classList.contains('alert')).to.be.equal(false);

			let view = new ComponentView(container, new ElementRef(el), null, {
				hasAlert: true,
			});

			let binding = new PropertyBinding(el, 'class.alert');
			view.attachBinding(binding, true, ExpressionParser.parse('hasAlert'));

			expect(el.classList.contains('alert')).to.be.equal(true);
		});

		it('should remove css class from element', () => {
			let el = Dom.el('<div [class.alert]="hasAlert" class="alert"></div>');

			expect(el.classList.contains('alert')).to.be.equal(true);

			let view = new ComponentView(container, new ElementRef(el), null, {
				hasAlert: false,
			});

			let binding = new PropertyBinding(el, 'class.alert');
			view.attachBinding(binding, true, ExpressionParser.parse('hasAlert'));

			expect(el.classList.contains('alert')).to.be.equal(false);
		});

		it("should bind and update simple value in element's property", () => {
			let el = Dom.el('<div [test]="hello"></div>');

			expect(el['test']).to.be.equal(undefined);

			let view = new ComponentView(container, new ElementRef(el), null, {
				hello: 'good day',
			});

			let binding = new PropertyBinding(el, 'test');
			view.attachBinding(binding, true, ExpressionParser.parse('hello'));

			expect(el['test']).to.be.equal('good day');

			view.parameters['hello'] = 'nope';
			view.changeDetectorRef.refresh();

			expect(el['test']).to.be.equal('nope');
		});

		it("should bind and update nested value in element's property", () => {
			let el = Dom.el('<div [test]="a[0].b"></div>');

			expect(el['test']).to.be.equal(undefined);

			let view = new ComponentView(container, new ElementRef(el), null, {
				a: [
					{
						b: 'good day',
					},
				],
			});

			let binding = new PropertyBinding(el, 'test');
			view.attachBinding(binding, true, ExpressionParser.parse('a[0].b'));

			expect(el['test']).to.be.equal('good day');

			view.parameters['a'][0]['b'] = 'nope';
			view.changeDetectorRef.refresh();

			expect(el['test']).to.be.equal('nope');
		});

	});

	describe('unbind()', () => {

		it("should stop watching for changes", () => {
			let el = Dom.el('<div [test]="hello"></div>');

			expect(el['test']).to.be.equal(undefined);

			let view = new ComponentView(container, new ElementRef(el), null, {
				hello: 'good day',
			});

			let binding = new PropertyBinding(el, 'test');
			view.attachBinding(binding, true, ExpressionParser.parse('hello'));

			expect(el['test']).to.be.equal('good day');

			view.parameters['hello'] = 'nope';
			view.changeDetectorRef.refresh();

			expect(el['test']).to.be.equal('nope');

			view.detach();
			view.parameters['hello'] = 'yes';
			view.changeDetectorRef.refresh();

			expect(el['test']).to.be.equal('nope');
		});

	});

});
