import {Application, Compiler, ComponentView, ApplicationView, ElementRef, TemplateRef, Component, Directive, OnInit, OnDestroy, Input} from '../../../core';
import {IfDirective} from '../../../common';
import {Container} from '../../../di';
import {Dom} from '../../../utils';


import chai = require('chai');


let expect = chai.expect;

let container: Container = null;
let application: Application = null;
let compiler: Compiler = null;


describe('#Compiler/components', () => {

	beforeEach(() => {
		container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	describe('compile()', () => {

		it('should use component', (done) => {
			@Component({
				selector: '[test]',
				template: '',
			})
			class Test implements OnInit {
				onInit() {
					done();
				}
			}

			let el = Dom.el('<div><div test></div></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [Test]);

			compiler.compile(view, Test);
		});

		it('should call onDestroy method on component', (done) => {
			@Component({
				selector: '[test]',
				template: '',
			})
			class Test implements OnDestroy {
				onDestroy() {
					done();
				}
			}

			let el = Dom.el('<div><div test></div></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [Test]);

			compiler.compile(view, Test);

			view.detach();
		});

		it('should pass View and ElementRef to controller', (done) => {
			let el = Dom.el('<div><div test></div></div>');

			@Component({
				selector: '[test]',
				template: '',
			})
			class Test {
				constructor(view: ComponentView, elRef: ElementRef) {
					expect(view).to.be.an.instanceof(ComponentView);
					expect(elRef).to.be.an.instanceof(ElementRef);
					expect(elRef.nativeEl).to.be.equal(el.querySelector('div'));

					done();
				}
			}

			var view = new ApplicationView(container, ElementRef.getByNode(el), [Test]);

			compiler.compile(view, Test);
		});

		it('should initialize component just once', () => {
			let calledApp = 0;
			let calledOuter = 0;
			let calledInner = 0;

			@Component({
				selector: '[inner]',
				template: '',
			})
			class Inner {
				constructor() {
					calledInner++;
				}
			}

			@Component({
				selector: '[outer]',
				directives: [Inner],
				template: '<div inner></div>',
			})
			class Outer {
				constructor() {
					calledOuter++;
				}
			}

			@Component({
				selector: '[app]',
				directives: [Outer],
				template: '<div outer></div>',
			})
			class App {
				constructor() {
					calledApp++;
				}
			}

			let el = Dom.el('<div><div app></div></div>');
			var view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			expect(calledApp).to.be.equal(1);
			expect(calledOuter).to.be.equal(1);
			expect(calledInner).to.be.equal(1);
		});

		it('should not allow to attach more than one component to one element', () => {
			@Component({
				selector: '[one]',
				template: '',
			})
			class One {}

			@Component({
				selector: '[two]',
				template: '',
			})
			class Two {}

			@Component({
				selector: '[app]',
				directives: [One, Two],
				template: '<div one two></div>',
			})
			class App {}

			let el = Dom.el('<div><div app></div></div>');
			var view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			expect(() => {
				compiler.compile(view, App);
			}).to.throw(Error, 'Can\'t attach component "Two" to element "div" since it\'s already attached to component "One".');
		});

		it('should throw an error when trying to inject TemplateRef in non template element', () => {
			@Component({
				selector: 'app',
				template: '',
			})
			class App {
				constructor(templateRef: TemplateRef) {}
			}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			expect(() => {
				compiler.compile(view, App);
			}).to.throw(Error, 'Can not import service "TemplateRef" into directive "App". Element "app" is not inside of any <template> element.');
		});

		it('should append component dynamically', (done) => {
			@Component({
				selector: 'appendable',
				controllerAs: 'a',
				template: '{{ a.title }}',
			})
			class Appendable {
				title = 'Hello';
			}

			@Component({
				selector: 'app',
				directives: [Appendable],
				template: '',
			})
			class App implements OnInit {
				constructor(public compiler: Compiler, public view: ComponentView, public el: ElementRef) {}
				onInit() {
					setTimeout(() => {
						let el = this.compiler.createComponent(this.view, '<appendable></appendable>');
						this.el.nativeEl.appendChild(el);
					}, 50);
				}
			}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			setTimeout(() => {
				expect(el.innerHTML).to.be.equal('<app><appendable>Hello</appendable></app>');
				done();
			}, 75);
		});

		it('should set root directive\'s input in component\'s element', (done) => {
			let appInput;
			let testInput;

			@Directive({
				selector: '[test]',
			})
			class Test implements OnInit {
				@Input('test-input')
				test;
				onInit() {
					testInput = this.test;
				}
			}

			@Component({
				selector: 'app',
				template: '',
			})
			class App implements OnInit {
				@Input('app-input')
				test;
				onInit() {
					appInput = this.test;
				}
			}

			let el = Dom.el('<div><app [app-input]="\'Hello!\'" test [test-input]="\'Hi!\'"></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App, Test]);

			compiler.compile(view, Test);
			compiler.compile(view, App);

			setTimeout(() => {
				expect(appInput).to.be.equal('Hello!');
				expect(testInput).to.be.equal('Hi!');
				done();
			}, 20);
		});

		it('should watch for changes in method calls', (done) => {
			@Component({
				selector: 'app',
				controllerAs: 'app',
				directives: [IfDirective],
				template:
					'status: ' +
					'<span *s:if="app.isVisible() && app.isAllowed()">Allowed</span>' +
					'<span *s:if="!app.isVisible() || !app.isVisible()">Denied</span>'
			})
			class App implements OnInit {
				visible = true;
				onInit() {
					setTimeout(() => {
						this.visible = false;
					}, 20);
				}
				isVisible() {
					return this.visible;
				}
				isAllowed() {
					return true;
				}
			}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			expect(el.innerText).to.be.equal('status: Allowed');

			setTimeout(() => {
				expect(el.innerText).to.be.equal('status: Denied');
				done();
			}, 50);
		});

	});

});
