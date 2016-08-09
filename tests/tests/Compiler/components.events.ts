import {Application, Compiler, ApplicationView, Component, HostEvent, HostElement} from '../../../core';
import {Container} from '../../../di';
import {Dom} from '../../../utils';


import chai = require('chai');


let expect = chai.expect;

let container: Container = null;
let application: Application = null;
let compiler: Compiler = null;


describe('#Compiler/components/events', () => {

	beforeEach(() => {
		container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	describe('compile()', () => {

		it('should call host event on main element', (done) => {
			@Component({
				selector: '[test]'
			})
			class Test {
				@HostEvent('click')
				onClick() {
					done();
				}
			}

			let el = Dom.el('<div><div test></div></div>');
			var view = new ApplicationView(container, el, Test);

			compiler.compile(view);

			el.querySelector('div').dispatchEvent(Dom.createMouseEvent('click'));
		});

		it('should call host event on child element', (done) => {
			@Component({
				selector: '[test]'
			})
			class Test {
				@HostEvent('a', 'click')
				onClick() {
					done();
				}
			}

			let el = Dom.el('<div><div test><a href="#"></a></div></div>');
			var view = new ApplicationView(container, el, Test);

			compiler.compile(view);

			el.querySelector('a').dispatchEvent(Dom.createMouseEvent('click'));
		});

		it('should call host event on attached child element', (done) => {
			@Component({
				selector: '[test]'
			})
			class Test {
				@HostElement('a')
				btn;

				@HostEvent('@btn', 'click')
				onClick() {
					done();
				}
			}

			let el = Dom.el('<div><div test><a href="#"></a></div></div>');
			var view = new ApplicationView(container, el, Test);

			compiler.compile(view);

			el.querySelector('a').dispatchEvent(Dom.createMouseEvent('click'));
		});

		it('should call component\'s event from template', (done) => {
			@Component({
				selector: '[test]',
				controllerAs: 'test',
				template: '<a href="#" (click)="test.onClick($event, $this)"></a>',
			})
			class Test {
				onClick(e: Event, el: HTMLLinkElement) {
					e.preventDefault();

					expect(this).to.be.an.instanceof(Test);
					expect(el.nodeName.toUpperCase()).to.be.equal('A');

					done();
				}
			}

			let el = Dom.el('<div><div test></div></div>');
			var view = new ApplicationView(container, el, Test);

			compiler.compile(view);

			el.querySelector('a').dispatchEvent(Dom.createMouseEvent('click'));
		});

		it('should refresh template after event is called', (done) => {
			@Component({
				selector: '[button]',
				controllerAs: 'btn',
				template: '<button (click)="btn.click()">{{ btn.title }}</button>',
			})
			class Button {
				title = 'Click';
				click() {
					this.title = 'Please, click';
				}
			}

			let el = Dom.el('<div><div button></div></div>');
			let view = new ApplicationView(container, el, Button);

			compiler.compile(view);

			expect(el.innerText).to.be.equal('Click');

			el.querySelector('button').dispatchEvent(Dom.createMouseEvent('click'));

			setTimeout(() => {
				expect(el.innerText).to.be.equal('Please, click');
				done();
			}, 50);
		});

		it('should refresh template after host event is called', (done) => {
			@Component({
				selector: '[button]',
				controllerAs: 'btn',
				template: '<button>{{ btn.title }}</button>',
			})
			class Button {
				title = 'Click';
				@HostEvent('button', 'click')
				click() {
					this.title = 'Please, click';
				}
			}

			let el = Dom.el('<div><div button></div></div>');
			let view = new ApplicationView(container, el, Button);

			compiler.compile(view);

			expect(el.innerText).to.be.equal('Click');

			el.querySelector('button').dispatchEvent(Dom.createMouseEvent('click'));

			setTimeout(() => {
				expect(el.innerText).to.be.equal('Please, click');
				done();
			}, 50);
		});

	});

});
