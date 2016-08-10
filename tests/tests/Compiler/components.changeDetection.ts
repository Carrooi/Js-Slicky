import {Application, Compiler, ComponentView, ApplicationView, Component, OnInit, ChangeDetectionStrategy} from '../../../core';
import {Container} from '../../../di';
import {Dom} from '../../../utils';


import chai = require('chai');


let expect = chai.expect;

let container: Container = null;
let application: Application = null;
let compiler: Compiler = null;


describe('#Compiler/components/changeDetection', () => {

	beforeEach(() => {
		container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	describe('compile()', () => {

		it('should use the default change detection strategy', (done) => {
			@Component({
				selector: 'app',
				controllerAs: 'app',
			})
			class App implements OnInit {
				title = 'Hello';
				onInit() {
					this.title = 'Hello world';
				}
			}

			let el = Dom.el('<div><app>{{ app.title }}</app></div>');
			let view = new ApplicationView(container, el, App);

			compiler.compile(view);

			setTimeout(() => {
				expect(el.innerText).to.be.equal('Hello world');
				done();
			}, 20);
		});

		it('should not invoke parent\'s refresh from child component', (done) => {
			@Component({
				selector: 'inner',
				controllerAs: 'i',
				template: '{{ i.title }}',
			})
			class Inner implements OnInit {
				title = 'Inner';
				constructor(public view: ComponentView) {}
				onInit() {
					setTimeout(() => {
						this.title = 'Inner refreshed';
						this.view.parent.parameters['a'].title = 'App refreshed';
					}, 10);
				}
			}

			@Component({
				selector: 'app',
				controllerAs: 'a',
				directives: [Inner],
				template: '{{ a.title }}, <inner></inner>',
			})
			class App {
				title = 'App';
			}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, el, App);

			compiler.compile(view);

			expect(el.innerText).to.be.equal('App, Inner');

			setTimeout(() => {
				expect(el.innerText).to.be.equal('App, Inner refreshed');
				done();
			}, 50);
		});

		it('should not invoke children\'s refresh from parent when it uses OnPush strategy', (done) => {
			@Component({
				selector: 'inner',
				controllerAs: 'i',
				template: '{{ i.title }}',
				changeDetection: ChangeDetectionStrategy.OnPush,
			})
			class Inner implements OnInit {
				title = 'Inner';
				onInit() {
					setTimeout(() => {
						this.title = 'Inner refreshed';
					}, 10);
				}
			}

			@Component({
				selector: 'app',
				controllerAs: 'a',
				directives: [Inner],
				template: '{{ a.title }}, <inner></inner>',
			})
			class App implements OnInit {
				title = 'App';
				onInit() {
					setTimeout(() => {
						this.title = 'App refreshed';
					}, 10);
				}
			}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, el, App);

			compiler.compile(view);

			expect(el.innerText).to.be.equal('App, Inner');

			setTimeout(() => {
				expect(el.innerText).to.be.equal('App refreshed, Inner');
				done();
			}, 50);
		});

		it('should inherit OnPush strategy from parent', (done) => {
			@Component({
				selector: 'inner',
				controllerAs: 'i',
				template: '{{ i.title }}',
			})
			class Inner implements OnInit {
				title = 'Inner';
				onInit() {
					setTimeout(() => {
						this.title = 'Inner refreshed';
					}, 10);
				}
			}

			@Component({
				selector: 'app',
				controllerAs: 'a',
				directives: [Inner],
				template: '{{ a.title }}, <inner></inner>',
				changeDetection: ChangeDetectionStrategy.OnPush,
			})
			class App implements OnInit {
				title = 'App';
				onInit() {
					setTimeout(() => {
						this.title = 'App refreshed';
					}, 10);
				}
			}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, el, App);

			compiler.compile(view);

			expect(el.innerText).to.be.equal('App, Inner');

			setTimeout(() => {
				expect(el.innerText).to.be.equal('App, Inner');
				done();
			}, 50);
		});

	});

});
