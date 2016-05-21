import {View} from '../../../../src/Views/View';
import {TextBinding} from '../../../../src/Templating/Binding/TextBinding';
import {ElementRef} from '../../../../src/Templating/ElementRef';
import {Container} from '../../../../src/DI/Container';
import {Compiler} from '../../../../src/Compiler';
import {Application} from '../../../../src/Application';
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
			let text = document.createTextNode('');
			let el = document.createElement('div');

			el.appendChild(text);

			let view = new View(new ElementRef(el), {
				a: 1,
				b: 2,
				c: 3,
			});

			let expr = ExpressionParser.precompile('a + b + c - 2');
			let binding = new TextBinding(text, expr, view);

			view.attachBinding(binding, expr);

			expect(el.innerText).to.be.equal('4');
		});

		it('should change property when it is changed', (done) => {
			var code = 'a + b + c - 2';
			let text = document.createTextNode(code);
			let el = document.createElement('div');

			el.appendChild(text);

			let view = new View(new ElementRef(el), {
				a: 1,
				b: 2,
				c: 3,
			});

			view.watcher.run();

			var expr = ExpressionParser.precompile(code);
			let binding = new TextBinding(text, expr, view);

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
			let code = 'a + b + c - 2';
			let text = document.createTextNode(code);
			let el = document.createElement('div');

			el.appendChild(text);

			let view = new View(new ElementRef(el), {
				a: 1,
				b: 2,
				c: 3,
			});

			view.watcher.run();

			let expr = ExpressionParser.precompile(code);
			let binding = new TextBinding(text, expr, view);

			view.attachBinding(binding, expr);

			expect(el.innerHTML).to.be.equal('4');

			view.parameters['c']--;

			setTimeout(() => {
				expect(el.innerHTML).to.be.equal('3');

				view.detach();

				view.parameters['c']--;

				setTimeout(() => {
					expect(el.innerHTML).to.be.equal('{{ ' + code + ' }}');
					done();
				}, 100);
			}, 100);
		});

	});

});
