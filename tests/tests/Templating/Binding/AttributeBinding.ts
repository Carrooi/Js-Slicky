import {Application, Compiler, View, ElementRef} from '../../../../core';
import {Container} from '../../../../di';
import {AttributeBinding} from '../../../../src/Templating/Binding/AttributeBinding';
import {ExpressionParser} from '../../../../src/Parsers/ExpressionParser';

import chai = require('chai');


let expect = chai.expect;

let application: Application = null;
let compiler: Compiler = null;


describe('#Templating/Binding/AttributeBinding', () => {

	beforeEach(() => {
		let container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	describe('bind()', () => {

		it("should bind simple value to element's property", () => {
			let parent = document.createElement('div');
			parent.innerHTML = '<div test="{{ hello }}"></div>';

			let el = <HTMLElement>parent.childNodes[0];

			expect(el['test']).to.be.equal(undefined);

			let view = new View(new ElementRef(el), {
				hello: 'good day',
			});

			let binding = new AttributeBinding(el, 'test');

			view.attachBinding(binding, ExpressionParser.precompile('hello'));

			expect(el['test']).to.be.equal('good day');
		});

		it("should bind result of expression to element's property", () => {
			let parent = document.createElement('div');
			parent.innerHTML = '<div test="{{ a + b + c }}"></div>';

			let el = <HTMLElement>parent.childNodes[0];

			expect(el['test']).to.be.equal(undefined);

			let view = new View(new ElementRef(el), {
				a: 1,
				b: 2,
				c: 3,
			});

			let binding = new AttributeBinding(el, 'test');

			view.attachBinding(binding, ExpressionParser.precompile('a + b + c'));

			expect(el['test']).to.be.equal(6);
		});

	});

});
