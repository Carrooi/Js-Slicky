import {Application, Component, Directive, OnInit, ElementRef} from '../../core';
import {Container} from '../../di';
import {Dom} from '../../utils';

import chai = require('chai');


let expect = chai.expect;
let application: Application = null;


describe('#Application', () => {

	beforeEach(() => {
		let container = new Container;
		application = new Application(container);
	});
	
	describe('run()', () => {
		
		it('should compile application with one root component', (done) => {
			@Component({
				selector: 'app',
				template: 'Hello world',
			})
			class App {}

			let el = Dom.el('<div><app></app></div>');
			
			application.run(App, el);
			
			setTimeout(() => {
				expect(el.innerHTML).to.be.equal('<app>Hello world</app>');
				done();
			}, 20);
		});

		it('should compile application with one directive', (done) => {
			@Directive({
				selector: 'div.test',
			})
			class Test implements OnInit {
				constructor(private el: ElementRef) {}
				onInit() {
					(<HTMLElement>this.el.nativeEl).innerText = 'Hello world';
				}
			}

			let el = Dom.el('<div><div class="test"></div></div>');

			application.run(Test, el);

			setTimeout(() => {
				expect(el.innerHTML).to.be.equal('<div class="test">Hello world</div>');
				done();
			}, 20);
		});

		it('should compile application with directives and components', (done) => {
			@Component({
				selector: 'app',
				template: 'Hello world',
			})
			class App {}

			@Directive({
				selector: 'div.test',
			})
			class Test implements OnInit {
				constructor(private el: ElementRef) {}
				onInit() {
					(<HTMLElement>this.el.nativeEl).innerText = 'Hello world';
				}
			}

			let el = Dom.el('<div><app></app><div class="test"></div></div>');

			application.run([App, Test], el);

			setTimeout(() => {
				expect(el.innerHTML).to.be.equal('<app>Hello world</app><div class="test">Hello world</div>');
				done();
			}, 20);
		});
		
	});

});
