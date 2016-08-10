import {Application, Compiler, ComponentView, ElementRef} from '../../../../core';
import {Container} from '../../../../di';
import {Dom} from '../../../../utils';
import {TextBinding} from '../../../../src/Templating/Binding/TextBinding';
import {ExpressionParser} from '../../../../src/Parsers/ExpressionParser';
import {MockApplicationView} from '../../../mocks/MockApplicationView';

import chai = require('chai');


let expect = chai.expect;

let container: Container = null;
let application: Application = null;
let compiler: Compiler = null;


describe('#Templating/Binding/TextBinding', () => {

	beforeEach(() => {
		container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	describe('bind()', () => {

		it('should evaluate expression in html', () => {
			let el = Dom.el('<div> </div>');
			let view = new ComponentView(container, new MockApplicationView(container), new ElementRef(el), {
				a: 1,
				b: 2,
				c: 3,
			});

			let expr = ExpressionParser.precompile('a + b + c - 2');
			let binding = new TextBinding(<Text>el.childNodes[0], expr, view);

			view.attachBinding(binding, expr);

			expect(el.innerText).to.be.equal('4');
		});

		it('should change property when it is changed', () => {
			let el = Dom.el('<div>a + b + c - 2</div>');
			let view = new ComponentView(container, new MockApplicationView(container), new ElementRef(el), {
				a: 1,
				b: 2,
				c: 3,
			});

			var expr = ExpressionParser.precompile('a + b + c - 2');
			let binding = new TextBinding(<Text>el.childNodes[0], expr, view);

			view.attachBinding(binding, expr);

			expect(el.innerHTML).to.be.equal('4');

			view.parameters['c']--;
			view.changeDetectorRef.refresh();

			expect(el.innerHTML).to.be.equal('3');
		});

	});

	describe('unbind()', () => {

		it('should change property and stop watching for changes', () => {
			let el = Dom.el('<div>a + b + c - 2</div>');
			let view = new ComponentView(container, new MockApplicationView(container), new ElementRef(el), {
				a: 1,
				b: 2,
				c: 3,
			});

			let expr = ExpressionParser.precompile('a + b + c - 2');
			let binding = new TextBinding(<Text>el.childNodes[0], expr, view);

			view.attachBinding(binding, expr);

			expect(el.innerHTML).to.be.equal('4');

			view.parameters['c']--;
			view.changeDetectorRef.refresh();

			expect(el.innerHTML).to.be.equal('3');

			view.detach();
			view.parameters['c']--;
			view.changeDetectorRef.refresh();

			expect(el.innerHTML).to.be.equal('{{ a + b + c - 2 }}');
		});

	});

});
