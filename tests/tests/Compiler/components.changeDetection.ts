import {Application, Compiler, ComponentView, ApplicationView, Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, Input} from '../../../core';
import {IfDirective, ForDirective} from '../../../common';
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
						this.view.parent.scope.findParameter('a').title = 'App refreshed';
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
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

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
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view);

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
				template: '<span *s:for="#item of app.items">{{ item.name }}</span>',
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

			compiler.compile(view);

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

			compiler.compile(view);

			expect(el.innerText).to.be.equal('Item: 1/a-first-a, Item: 2/a-second-a, Item: 3/a-third-a');

			setTimeout(() => {
				expect(el.innerText).to.be.equal('Item: 1/A-first-A, Item: 2/A-second-A, Item: 3/A-third-A');
				done();
			}, 25);
		});

		it('should update property of exported component', () => {
			@Component({
				selector: 'button',
				controllerAs: 'btn',
				template: '{{ btn.title }}',
			})
			class Button implements OnInit {
				title = 'Cool button';
				onInit() {
					this.title = 'Super cool button';
				}
			}

			@Component({
				selector: 'app',
				controllerAs: 'app',
				directives: [Button],
				template: '<button #b></button>, Title: {{ b.title }}',
			})
			class App {}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view);

			expect(el.innerText).to.be.equal('Super cool button, Title: Super cool button');
		});

		it('should update items in loop with OnPush change detection', (done) => {
			@Component({
				selector: 'item',
				controllerAs: 'item',
				template: '- {{ item.data.title }} -',
			})
			class Item implements OnInit {
				@Input()
				data;
				@Input()
				app;
				onInit() {
					if (this.data.title === 'B') {
						setTimeout(() => {
							this.app.remove(this.data);
						}, 30);
					}
				}
			}

			@Component({
				selector: 'app',
				controllerAs: 'app',
				template: '<template [s:if]="app.items.length">items: <item *s:for="#data of app.items" [app]="app" [data]="data"></item></template>',
				directives: [Item, IfDirective, ForDirective],
				changeDetection: ChangeDetectionStrategy.OnPush,
			})
			class App implements OnInit {
				items = [];
				constructor(private changeDetector: ChangeDetectorRef) {}
				onInit() {
					setTimeout(() => {
						this.items = [
							{title: 'A'}, {title: 'B'}, {title: 'C'},
						];
						this.changeDetector.refresh();
					}, 10);
				}
				remove(item) {
					let i = this.items.indexOf(item);
					this.items.splice(i, 1);
					this.changeDetector.refresh();
				}
			}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view);

			setTimeout(() => {
				expect(el.innerText).to.be.equal('items: - A -- B -- C -');
			}, 20);

			setTimeout(() => {
				expect(el.innerText).to.be.equal('items: - A -- C -');
				done();
			}, 200);
		});

	});

});
