import {Application, Compiler, ApplicationView, Component, HostElement, OnInit} from '../../../core';
import {Container} from '../../../di';
import {Dom} from '../../../utils';


import chai = require('chai');


let expect = chai.expect;

let container: Container = null;
let application: Application = null;
let compiler: Compiler = null;


describe('#Compiler/components/elements', () => {

	beforeEach(() => {
		container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	describe('compile()', () => {

		it('should load itself as an host element', (done) => {
			let el = Dom.el('<div><div test></div></div>');

			@Component({
				selector: '[test]'
			})
			class Test implements OnInit {
				@HostElement()
				el;

				onInit() {
					expect(this.el).to.be.equal(el.querySelector('div'));
					done();
				}
			}

			let view = new ApplicationView(container, el, Test);

			compiler.compile(view);
		});

		it('should load child element', (done) => {
			let el = Dom.el('<div><div test><span>hello</span></div></div>');

			@Component({
				selector: '[test]'
			})
			class Test implements OnInit {
				@HostElement('span')
				child;

				onInit() {
					expect(this.child).to.be.equal(el.querySelector('span'));
					done();
				}
			}

			var view = new ApplicationView(container, el, Test);

			compiler.compile(view);
		});

	});

});
