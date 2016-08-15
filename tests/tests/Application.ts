import {Application, Component, Directive, Filter, OnInit, ElementRef} from '../../core';
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
			
			application.run(App, {
				parentElement: el,
			});
			
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

			application.run(Test, {
				parentElement: el,
			});

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

			application.run([App, Test], {
				parentElement: el,
			});

			setTimeout(() => {
				expect(el.innerHTML).to.be.equal('<app>Hello world</app><div class="test">Hello world</div>');
				done();
			}, 20);
		});

		it('should register custom filters for all root directives', (done) => {
			@Filter({
				name: 'plus',
			})
			class PlusFilter {
				transform(num) {
					return num + 1;
				}
			}

			@Component({
				selector: 'button',
				controllerAs: 'btn',
				template: '{{ btn.number | plus }}'
			})
			class Button {
				number = 4;
			}

			let el = Dom.el('<div><button></button></div>');

			application.run([Button], {
				parentElement: el,
				filters: [PlusFilter],
			});

			setTimeout(() => {
				expect(el.innerHTML).to.be.equal('<button>5</button>');
				done();
			}, 20);
		});
		
	});

});
