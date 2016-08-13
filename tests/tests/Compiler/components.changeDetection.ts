import {Application, Compiler, ComponentView, ApplicationView, Component, OnInit, ChangeDetectionStrategy, ElementRef} from '../../../core';
import {ForDirective} from '../../../common';
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
				template: '{{ app.title }}',
			})
			class App implements OnInit {
				title = 'Hello';
				onInit() {
					this.title = 'Hello world';
				}
			}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

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
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

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
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

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
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			expect(el.innerText).to.be.equal('App, Inner');

			setTimeout(() => {
				expect(el.innerText).to.be.equal('App, Inner');
				done();
			}, 50);
		});

		it('should update view when for bindings added in for loop', (done) => {
			@Component({
				selector: 'app',
				controllerAs: 'app',
				directives: [ForDirective],
				template: '<span *s:for="#item in app.items">{{ item.name }}</span>',
			})
			class App implements OnInit {
				items = [
					{name: 'a'},
					{name: 'b'},
					{name: 'c'},
				];
				onInit() {
					setTimeout(() => {
						this.items[1].name = 'B';
					}, 10);
				}
			}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			expect(el.innerText).to.be.equal('abc');

			setTimeout(() => {
				expect(el.innerText).to.be.equal('aBc');
				done();
			}, 25);
		});

		it('should update parameter inside of inserted template', (done) => {
			@Component({
				selector: 'app',
				controllerAs: 'app',
				template:
					'<template id="tmpl">' +
						'Item: {{ id + "/" + title + app.postfix + (!last ? ", ": "") }}' +
					'</template>' +
					'<content select="#tmpl" import="id: 1, title: app.prefix + \'first\'"></content>' +
					'<content select="#tmpl" import="id: 2, title: app.prefix + \'second\'"></content>' +
					'<content select="#tmpl" import="id: 3, title: app.prefix + \'third\', last: true"></content>'
			})
			class App implements OnInit {
				prefix = 'a-';
				postfix = '-a';
				onInit() {
					setTimeout(() => {
						this.prefix = 'A-';
						this.postfix = '-A';
					}, 10);
				}
			}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			expect(el.innerText).to.be.equal('Item: 1/a-first-a, Item: 2/a-second-a, Item: 3/a-third-a');

			setTimeout(() => {
				expect(el.innerText).to.be.equal('Item: 1/A-first-A, Item: 2/A-second-A, Item: 3/A-third-A');
				done();
			}, 25);
		});

	});

});
