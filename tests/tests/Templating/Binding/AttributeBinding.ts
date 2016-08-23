import {Application, Compiler, ComponentView, ElementRef} from '../../../../core';
import {Container} from '../../../../di';
import {Dom} from '../../../../utils';
import {AttributeBinding} from '../../../../src/Templating/Binding/AttributeBinding';
import {ExpressionParser} from '../../../../src/Parsers/ExpressionParser';

import chai = require('chai');


let expect = chai.expect;

let container: Container = null;
let application: Application = null;
let compiler: Compiler = null;


describe('#Templating/Binding/AttributeBinding', () => {

	beforeEach(() => {
		container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	describe('bind()', () => {

		it("should bind simple value to element's property", () => {
			let el = Dom.el('<div test="{{ hello }}"></div>');

			expect(el['test']).to.be.equal(undefined);

			let view = new ComponentView(container, new ElementRef(el), null, {
				hello: 'good day',
			});

			let binding = new AttributeBinding(el, 'test');

			view.attachBinding(binding, true, ExpressionParser.parse('hello'));

			expect(el['test']).to.be.equal('good day');
		});

		it("should bind result of expression to element's property", () => {
			let el = Dom.el('<div test="{{ a + b + c }}"></div>');

			expect(el['test']).to.be.equal(undefined);

			let view = new ComponentView(container, new ElementRef(el), null, {
				a: 1,
				b: 2,
				c: 3,
			});

			let binding = new AttributeBinding(el, 'test');

			view.attachBinding(binding, true, ExpressionParser.parse('a + b + c'));

			expect(el['test']).to.be.equal(6);
		});

	});

});
