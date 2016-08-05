import {Application, Compiler, ComponentView, ElementRef} from '../../../../core';
import {Container} from '../../../../di';
import {Dom} from '../../../../utils';
import {TextBinding} from '../../../../src/Templating/Binding/TextBinding';
import {ExpressionParser} from '../../../../src/Parsers/ExpressionParser';

import chai = require('chai');


let expect = chai.expect;

let application: Application = null;
let compiler: Compiler = null;


describe('#Templating/Binding/TextBinding', () => {

	beforeEach(() => {
		let container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	describe('bind()', () => {

		it('should evaluate expression in html', () => {
			let el = Dom.el('<div> </div>');
			let view = new ComponentView(new ElementRef(el), {
				a: 1,
				b: 2,
				c: 3,
			});

			let expr = ExpressionParser.precompile('a + b + c - 2');
			let binding = new TextBinding(<Text>el.childNodes[0], expr, view);

			view.attachBinding(binding, expr);

			expect(el.innerText).to.be.equal('4');
		});

		it('should change property when it is changed', (done) => {
			let el = Dom.el('<div>a + b + c - 2</div>');
			let view = new ComponentView(new ElementRef(el), {
				a: 1,
				b: 2,
				c: 3,
			});

			view.watcher.run();

			var expr = ExpressionParser.precompile('a + b + c - 2');
			let binding = new TextBinding(<Text>el.childNodes[0], expr, view);

			view.attachBinding(binding, expr);

			expect(el.innerHTML).to.be.equal('4');

			view.parameters['c']--;

			setTimeout(() => {
				expect(el.innerHTML).to.be.equal('3');
				done();
			}, 100);
		});

	});

	describe('unbind()', () => {

		it('should change property and stop watching for changes', (done) => {
			let el = Dom.el('<div>a + b + c - 2</div>');
			let view = new ComponentView(new ElementRef(el), {
				a: 1,
				b: 2,
				c: 3,
			});

			view.watcher.run();

			let expr = ExpressionParser.precompile('a + b + c - 2');
			let binding = new TextBinding(<Text>el.childNodes[0], expr, view);

			view.attachBinding(binding, expr);

			expect(el.innerHTML).to.be.equal('4');

			view.parameters['c']--;

			setTimeout(() => {
				expect(el.innerHTML).to.be.equal('3');

				view.detach();

				view.parameters['c']--;

				setTimeout(() => {
					expect(el.innerHTML).to.be.equal('{{ a + b + c - 2 }}');
					done();
				}, 100);
			}, 100);
		});

	});

});
