import {Application, Compiler, View, ElementRef} from '../../../../core';
import {Container} from '../../../../di';
import {PropertyBinding} from '../../../../src/Templating/Binding/PropertyBinding';
import {ExpressionParser} from '../../../../src/Parsers/ExpressionParser';

import chai = require('chai');


let expect = chai.expect;

let application: Application = null;
let compiler: Compiler = null;


describe('#Templating/Binding/PropertyBinding', () => {

	beforeEach(() => {
		let container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	describe('bind()', () => {

		it("should bind simple value to element's property", () => {
			let parent = document.createElement('div');
			parent.innerHTML = '<div [test]="hello"></div>';

			let el = <HTMLElement>parent.childNodes[0];

			expect(el['test']).to.be.equal(undefined);

			let view = new View(new ElementRef(el), {
				hello: 'good day',
			});

			let binding = new PropertyBinding(el, 'test');

			view.attachBinding(binding, ExpressionParser.precompile('hello'));

			expect(el['test']).to.be.equal('good day');
		});

		it("should bind nested value to element's property", () => {
			let parent = document.createElement('div');
			parent.innerHTML = '<div [test]="obj.greetings[0]"></div>';

			let el = <HTMLElement>parent.childNodes[0];

			expect(el['test']).to.be.equal(undefined);

			let view = new View(new ElementRef(el), {
				obj: {
					greetings: ['good day'],
				},
			});

			let binding = new PropertyBinding(el, 'test');

			view.attachBinding(binding, ExpressionParser.precompile('obj.greetings[0]'));

			expect(el['test']).to.be.equal('good day');
		});

		it("should bind result of expression to element's property", () => {
			let parent = document.createElement('div');
			parent.innerHTML = '<div [test]="a + b + c"></div>';

			let el = <HTMLElement>parent.childNodes[0];

			expect(el['test']).to.be.equal(undefined);

			let view = new View(new ElementRef(el), {
				a: 1,
				b: 2,
				c: 3,
			});

			let binding = new PropertyBinding(el, 'test');

			view.attachBinding(binding, ExpressionParser.precompile('a + b + c'));

			expect(el['test']).to.be.equal(6);
		});

		it("should bind value to element's inner html", () => {
			let parent = document.createElement('div');
			parent.innerHTML = '<div [innerHTML]="hello"></div>';

			let el = <HTMLElement>parent.childNodes[0];

			let view = new View(new ElementRef(el), {
				hello: 'good day',
			});

			let binding = new PropertyBinding(el, 'innerHTML');

			view.attachBinding(binding, ExpressionParser.precompile('hello'));

			expect(el.innerHTML).to.be.equal('good day');
		});

		it('should bind style to element', () => {
			let parent = document.createElement('div');
			parent.innerHTML = '<div [style.border]="border"></div>';

			let el = <HTMLElement>parent.childNodes[0];

			expect(el.style.border).to.be.equal('');

			let view = new View(new ElementRef(el), {
				border: '1px solid red',
			});

			let binding = new PropertyBinding(el, 'style.border');

			view.attachBinding(binding, ExpressionParser.precompile('border'));

			expect(el.style.border).to.be.equal('1px solid red');
		});

		it('should remove style from element', () => {
			let parent = document.createElement('div');
			parent.innerHTML = '<div [style.border]="border" style="border: 1px solid red;"></div>';

			let el = <HTMLElement>parent.childNodes[0];

			expect(el.style.border).to.be.equal('1px solid red');

			let view = new View(new ElementRef(el), {
				border: false,
			});

			let binding = new PropertyBinding(el, 'style.border');

			view.attachBinding(binding, ExpressionParser.precompile('border'));

			expect(el.style.border).to.be.equal('');
		});

		it('should bind css class to element', () => {
			let parent = document.createElement('div');
			parent.innerHTML = '<div [class.alert]="hasAlert"></div>';

			let el = <HTMLElement>parent.childNodes[0];

			expect(el.classList.contains('alert')).to.be.equal(false);

			let view = new View(new ElementRef(el), {
				hasAlert: true,
			});

			let binding = new PropertyBinding(el, 'class.alert');

			view.attachBinding(binding, ExpressionParser.precompile('hasAlert'));

			expect(el.classList.contains('alert')).to.be.equal(true);
		});

		it('should remove css class from element', () => {
			let parent = document.createElement('div');
			parent.innerHTML = '<div [class.alert]="hasAlert" class="alert"></div>';

			let el = <HTMLElement>parent.childNodes[0];

			expect(el.classList.contains('alert')).to.be.equal(true);

			let view = new View(new ElementRef(el), {
				hasAlert: false,
			});

			let binding = new PropertyBinding(el, 'class.alert');

			view.attachBinding(binding, ExpressionParser.precompile('hasAlert'));

			expect(el.classList.contains('alert')).to.be.equal(false);
		});

		it("should bind and update simple value in element's property", (done) => {
			let parent = document.createElement('div');
			parent.innerHTML = '<div [test]="hello"></div>';

			let el = <HTMLElement>parent.childNodes[0];

			expect(el['test']).to.be.equal(undefined);

			let view = new View(new ElementRef(el), {
				hello: 'good day',
			});

			view.watcher.run();

			let binding = new PropertyBinding(el, 'test');

			view.attachBinding(binding, ExpressionParser.precompile('hello'));

			expect(el['test']).to.be.equal('good day');

			view.parameters['hello'] = 'nope';

			setTimeout(() => {
				expect(el['test']).to.be.equal('nope');
				done();
			}, 100);
		});

		it("should bind and update nested value in element's property", (done) => {
			let parent = document.createElement('div');
			parent.innerHTML = '<div [test]="a[0].b"></div>';

			let el = <HTMLElement>parent.childNodes[0];

			expect(el['test']).to.be.equal(undefined);

			let view = new View(new ElementRef(el), {
				a: [
					{
						b: 'good day',
					},
				],
			});

			view.watcher.run();

			let binding = new PropertyBinding(el, 'test');

			view.attachBinding(binding, ExpressionParser.precompile('a[0].b'));

			expect(el['test']).to.be.equal('good day');

			view.parameters['a'][0]['b'] = 'nope';

			setTimeout(() => {
				expect(el['test']).to.be.equal('nope');
				done();
			}, 100);
		});

	});

	describe('unbind()', () => {

		it("should stop watching for changes", (done) => {
			let parent = document.createElement('div');
			parent.innerHTML = '<div [test]="hello"></div>';

			let el = <HTMLElement>parent.childNodes[0];

			expect(el['test']).to.be.equal(undefined);

			let view = new View(new ElementRef(el), {
				hello: 'good day',
			});

			view.watcher.run();

			let binding = new PropertyBinding(el, 'test');

			view.attachBinding(binding, ExpressionParser.precompile('hello'));

			expect(el['test']).to.be.equal('good day');

			view.parameters['hello'] = 'nope';

			setTimeout(() => {
				expect(el['test']).to.be.equal('nope');

				view.detach();

				view.parameters['hello'] = 'yes';

				setTimeout(() => {
					expect(el['test']).to.be.equal('nope');
					done();
				}, 100);
			}, 100);
		});

	});

});
