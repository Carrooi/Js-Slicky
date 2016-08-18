import {
	Application, Compiler, ComponentView, ApplicationView, Component, Directive, ElementRef, Filter, Input, OnInit,
	ChangeDetectorRef, ChangeDetectionStrategy
} from '../../../core';
import {IfDirective, ForDirective} from '../../../common';
import {Container} from '../../../di';
import {Dom} from '../../../utils';


import chai = require('chai');


let expect = chai.expect;

let container: Container = null;
let application: Application = null;
let compiler: Compiler = null;


describe('#Compiler/template', () => {

	beforeEach(() => {
		container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	describe('compile()', () => {

		it('should compile component\'s template', () => {
			@Component({
				selector: '[test]',
				controllerAs: 'test',
				template: 'days: {{ test.days }}'
			})
			class Test {
				public days: number = 2;
			}

			let el = Dom.el('<div><div test></div></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [Test]);

			compiler.compile(view, Test);

			expect(el.innerText).to.be.equal('days: 2');
		});

		it('should update property in template', (done) => {
			@Component({
				selector: '[test]',
				controllerAs: 'test',
				template: 'days: {{ test.days }}',
			})
			class Test implements OnInit {
				days: number = 2;
				onInit(): void
				{
					setTimeout(() => {
						this.days--;
					}, 50);
				}
			}

			let el = Dom.el('<div><div test></div></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [Test]);

			compiler.compile(view, Test);

			expect(el.innerText).to.be.equal('days: 2');

			setTimeout(() => {
				expect(el.innerText).to.be.equal('days: 1');
				done();
			}, 100);
		});

		it('should update property in template with OnPush strategy', (done) => {
			@Component({
				selector: 'app',
				controllerAs: 'app',
				changeDetection: ChangeDetectionStrategy.OnPush,
				template: 'number: {{ app.number }}',
			})
			class App implements OnInit {
				number = 0;
				constructor(private changeDetectionRef: ChangeDetectorRef) {}
				onInit() {
					this.number++;

					setTimeout(() => {
						this.number++;
					}, 5);

					setTimeout(() => {
						this.number++;
						this.changeDetectionRef.refresh();
					}, 40);
				}
			}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			expect(el.innerText).to.be.equal('number: 0');

			setTimeout(() => {
				expect(el.innerText).to.be.equal('number: 0');
			}, 20);

			setTimeout(() => {
				expect(el.innerText).to.be.equal('number: 3');
				done();
			}, 50);
		});

		it('should update property in attribute', () => {
			@Component({
				selector: '[test]',
				template: '<span class="{{ alertType }}"></span>',
			})
			class Test {}

			let el = Dom.el('<div><div test></div></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [Test]);

			view.parameters['alertType'] = 'success';

			compiler.compile(view, Test);

			let innerView = <ComponentView>view.children[0];

			expect(el.querySelector('span').className).to.be.equal('success');

			innerView.parameters['alertType'] = 'danger';
			innerView.changeDetectorRef.refresh();

			expect(el.querySelector('span').className).to.be.equal('danger');
		});

		it('should have access to parent component', () => {
			@Component({
				selector: '[child]',
				controllerAs: 'inner',
				template: "I'm {{ inner.type }} and my parent is {{ outer.type }}",
			})
			class Child {
				type = 'inner';
			}

			@Component({
				selector: '[parent]',
				controllerAs: 'outer',
				template: "I'm {{ outer.type }} / <div child></div>",
				directives: [Child],
			})
			class Parent {
				type = 'outer';
			}

			let el = Dom.el('<div><div parent></div></div>');
			var view = new ApplicationView(container, ElementRef.getByNode(el), [Parent]);

			compiler.compile(view, Parent);

			expect(el.innerText).to.be.equal("I'm outer / I'm inner and my parent is outer");
		});

		it('should use parent component as input', (done) => {
			@Component({
				selector: '[child]',
				template: '',
			})
			class Child implements OnInit {
				@Input('parent')
				parent: Parent;

				onInit() {
					expect(this.parent).to.be.an.instanceof(Parent);
					done();
				}
			}

			@Component({
				selector: '[parent]',
				controllerAs: 'outer',
				template: '<div child [parent]="outer"></div>',
				directives: [Child],
			})
			class Parent {}

			let el = Dom.el('<div><div parent></div></div>');
			var view = new ApplicationView(container, ElementRef.getByNode(el), [Parent]);

			compiler.compile(view, Parent);
		});

		it('should throw an error when trying to add unknown property to non-root component', () => {
			@Component({
				selector: 'cmp',
				template: '',
			})
			class Test {}

			@Component({
				selector: 'app',
				directives: [Test],
				template: '<cmp [unknown-prop]="a"></cmp>',
			})
			class App {}

			let el = Dom.el('<div><app></app></div>');
			var view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			expect(() => {
				compiler.compile(view, App);
			}).to.throw(Error, 'Could not bind property unknown-prop to element cmp or to any of its directives.');
		});

		it('should not throw an error when trying to add unknown property to root component', () => {
			@Component({
				selector: 'app',
				template: '',
			})
			class App {}

			let el = Dom.el('<div><app [unknown-prop]="a"></app></div>');
			var view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);
		});

		it('should use if directive', () => {
			@Component({
				selector: '[test]',
				controllerAs: 'test',
				template: '<span *s:if="!!true">{{ test.number }}</span>',
				directives: [IfDirective],
			})
			class Test {
				number = 1;
			}

			let el = Dom.el('<div><div test></div></div>');
			var view = new ApplicationView(container, ElementRef.getByNode(el), [Test]);

			compiler.compile(view, Test);

			expect(el.innerText).to.be.equal('1');
		});

		it('should use custom directive', () => {
			@Directive({
				selector: '[c\\:directive]',
			})
			class TestDirective implements OnInit {
				constructor(private el: ElementRef) {}
				onInit() {
					(<HTMLSpanElement>this.el.nativeEl).innerText = 'hello';
				}
			}

			@Component({
				selector: '[test]',
				directives: [TestDirective],
				template: '<span c:directive></span>',
			})
			class TestComponent {}

			let el = Dom.el('<div><div test></div></div>');
			var view = new ApplicationView(container, ElementRef.getByNode(el), [TestComponent]);

			compiler.compile(view, TestComponent);

			expect(el.innerText).to.be.equal('hello');
		});

		it('should call build in template filter', () => {
			@Component({
				selector: '[test]',
				controllerAs: 'test',
				template: '{{ test.s | lower }}',
			})
			class Test {
				s = 'LOREM';
			}

			let el = Dom.el('<div><div test></div></div>');
			var view = new ApplicationView(container, ElementRef.getByNode(el), [Test]);

			compiler.compile(view, Test);

			expect(el.innerText).to.be.equal('lorem');
		});

		it('should add custom filter to template', () => {
			@Filter({
				name: 'plus',
			})
			class PlusFilter {
				transform(num) {
					return num + 1;
				}
			}

			@Component({
				selector: '[test]',
				controllerAs: 'test',
				template: '{{ test.num | plus }}',
				filters: [PlusFilter],
			})
			class Test {
				num = 1;
			}

			let el = Dom.el('<div><div test></div></div>');
			var view = new ApplicationView(container, ElementRef.getByNode(el), [Test]);

			compiler.compile(view, Test);

			expect(el.innerText).to.be.equal('2');
		});

		it('should call filter registered in parent', () => {
			@Filter({
				name: 'plus',
			})
			class PlusFilter {
				transform(num) {
					return num + 1;
				}
			}

			@Component({
				selector: '[test]',
				controllerAs: 'test',
				template: '{{ test.num | plus }}',
			})
			class Test {
				num = 1;
			}

			@Component({
				selector: 'app',
				template: '<div test></div>',
				filters: [PlusFilter],
				directives: [Test],
			})
			class App {}

			let el = Dom.el('<div><app></app></div>');
			var view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			expect(el.innerText).to.be.equal('2');
		});

		it('should have access to all parents components', () => {
			@Component({
				selector: '[child]',
				template: '<inner></inner>',
			})
			class Child {}

			@Component({
				selector: 'inner',
				template: 'inner component',
			})
			class Inner {}

			@Component({
				selector: '[root]',
				template: '<div child></div>',
				directives: [Child, Inner],
			})
			class Root {}

			let el = Dom.el('<div><div root></div></div>');
			var view = new ApplicationView(container, ElementRef.getByNode(el), [Root]);

			compiler.compile(view, Root);

			expect(el.innerText).to.be.equal('inner component');
		});

		it('should compile components inside of main components template', () => {
			@Component({
				selector: '[test]',
				controllerAs: 'test',
				template: 'num: {{ app.num / test.num }}',
			})
			class Test {
				public num = 5;
			}

			@Component({
				selector: '[app]',
				controllerAs: 'app',
				directives: [Test],
				template: 'num: {{ app.num }} / <div test></div>',
			})
			class Main {
				public num = 20;
			}

			let el = Dom.el('<div><div app></div></div>');
			var view = new ApplicationView(container, ElementRef.getByNode(el), [Main]);

			compiler.compile(view, Main);

			expect((<HTMLElement>el.querySelector('div')).innerText).to.be.equal('num: 20 / num: 4');
		});

		it('should add inner text from template with if directive', () => {
			@Component({
				selector: 'app',
				directives: [IfDirective],
				template: '<template [s:if]="true">hello</template>',
			})
			class App {}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			expect(el.innerText).to.be.equal('hello');
		});

		it('should refresh template from change in onInit event', (done) => {
			@Component({
				selector: '[button]',
				controllerAs: 'btn',
				template: '<button>{{ btn.title }}</button>',
			})
			class Button implements OnInit {
				title = 'Click';
				onInit() {
					setTimeout(() => {
						this.title = 'Please, click';
					}, 10);
				}
			}

			let el = Dom.el('<div><div button></div></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [Button]);

			compiler.compile(view, Button);

			expect(el.innerText).to.be.equal('Click');

			setTimeout(() => {
				expect(el.innerText).to.be.equal('Please, click');
				done();
			}, 50);
		});

		it('should compile component with for directive', () => {
			@Component({
				selector: 'inner-item',
				controllerAs: 'inner',
				template: '<template [s:if]="inner.item">{{ inner.item }}, </template>',
			})
			class Inner {
				@Input()
				item;
			}

			@Component({
				selector: 'app',
				controllerAs: 'app',
				directives: [IfDirective, ForDirective, Inner],
				template: '<inner-item *s:for="#item in app.items" [item]="item"></inner-item>'
			})
			class App {
				items = ['a', 'b', 'c'];
			}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			expect(el.innerText).to.be.equal('a, b, c, ');
		});

		it('should attach variable to inner component', () => {
			@Component({
				selector: 'item',
				controllerAs: 'item',
				template: '{{ item.data }} world',
			})
			class Item {
				@Input()
				data: any;
			}

			@Component({
				selector: 'app',
				directives: [Item],
				template: '<item [data]="a"></item>',
			})
			class App {}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			view.parameters['a'] = 'hello';

			compiler.compile(view, App);

			expect(el.innerText).to.be.equal('hello world');
		});

		it('should attach new variable to inner component', () => {
			@Component({
				selector: 'item',
				controllerAs: 'item',
				template: '<template [s:if]="item.data">{{ item.data }} world</template>',
			})
			class Item {
				@Input()
				data: any;
			}

			@Component({
				selector: 'app',
				directives: [ForDirective, IfDirective, Item],
				template: '<item *s:for="#data in list" [data]="data"></item>',
			})
			class App {}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			view.parameters['list'] = ['hello'];

			compiler.compile(view, App);

			expect(el.innerText).to.be.equal('hello world');
		});

		it('should compile complex component with template', (done) => {
			@Component({
				selector: '[item]',
				controllerAs: 'item',
				template: '<template [s:if]="item.data">{{ item.data }}</template>',
			})
			class ItemComponent {
				@Input()
				data;
			}

			@Component({
				selector: 'container',
				controllerAs: 'container',
				directives: [ItemComponent],
				template: '<ul><li *s:for="#itemData in container.items" item [data]="itemData"></li></ul>',
			})
			class ContainerComponent implements OnInit {
				items = [];
				onInit() {
					setTimeout(() => {
						let items = ['a', 'b', 'c'];
						for (let i = 0; i < items.length; i++) {
							this.items.push(items[i]);
						}
					}, 50);
				}
			}

			@Component({
				selector: 'app',
				directives: [IfDirective, ForDirective, ContainerComponent],
				template: '<container></container>',
			})
			class App {}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			setTimeout(() => {
				expect(el.innerText).to.be.equal('abc');
				done();
			}, 200);
		});

		it('should display data in for loop with timeout', (done) => {
			@Component({
				selector: 'app',
				controllerAs: 'app',
				directives: [ForDirective],
				template: '<span *s:for="#letter in app.letters">{{ letter }}</span>',
			})
			class App implements OnInit {
				letters = [];
				onInit() {
					setTimeout(() => {
						this.letters = ['a', 'b', 'c'];
					}, 20);
				}
			}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			setTimeout(() => {
				expect(el.innerText).to.be.equal('abc');
				done();
			}, 50);
		});

		it('should create new inner component from for loop with additional data', (done) => {
			let letters = [];

			@Component({
				selector: '[letter]',
				controllerAs: 'l',
				template: '',
			})
			class Letter implements OnInit {
				@Input()
				name;
				onInit() {
					letters.push(this.name);
				}
			}

			@Component({
				selector: 'app',
				controllerAs: 'app',
				directives: [ForDirective, Letter],
				template: '<span *s:for="#letter in app.letters" letter [name]="letter"></span>',
			})
			class App implements OnInit {
				letters = [];
				onInit() {
					setTimeout(() => {
						this.letters.push('a');
						this.letters.push('b');
						this.letters.push('c');
					}, 20);
				}
			}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			setTimeout(() => {
				expect(letters).to.be.eql(['a', 'b', 'c']);
				done();
			}, 50);
		});

		it('should compile complex component', (done) => {
			@Component({
				selector: '[item]',
				controllerAs: 'item',
				template: '<a *s:if="item.data">{{ item.data }}</a>',
			})
			class ItemComponent {
				@Input()
				data;
			}

			@Component({
				selector: 'container',
				controllerAs: 'container',
				directives: [ItemComponent],
				template: '<ul><li *s:for="#itemData in container.items" item [data]="itemData"></li></ul>',
			})
			class ContainerComponent implements OnInit {
				items = [];
				onInit() {
					setTimeout(() => {
						let items = ['a', 'b', 'c'];
						for (let i = 0; i < items.length; i++) {
							this.items.push(items[i]);
						}
					}, 50);
				}
			}

			@Component({
				selector: 'app',
				directives: [IfDirective, ForDirective, ContainerComponent],
				template: '<container></container>',
			})
			class App {}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			setTimeout(() => {
				expect(el.innerText).to.be.equal('abc');
				done();
			}, 200);
		});

		it('should update expression in nested object', () => {
			@Component({
				selector: 'app',
				controllerAs: 'app',
				template: '<span>{{ app.obj.a }}</span>',
			})
			class App {
				obj = {
					a: 'hello world',
				};
			}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			expect(el.innerText).to.be.equal('hello world');

			let innerView = <ComponentView>view.children[0];

			innerView.parameters['app'].obj = {a: 'hi'};
			innerView.changeDetectorRef.refresh();

			expect(el.innerText).to.be.equal('hi');
		});

		it('should export component to parent component', () => {
			@Component({
				selector: 'button',
				controllerAs: 'btn',
				template: '{{ btn.title }}',
			})
			class Button {
				title = 'Cool button';
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

			compiler.compile(view, App);

			expect(el.innerText).to.be.equal('Cool button, Title: Cool button');
		});

		it('should export directive into parent component', () => {
			@Directive({
				selector: 'span',
			})
			class Span {
				title = 'Cool span';
			}

			@Component({
				selector: 'app',
				controllerAs: 'app',
				directives: [Span],
				template: '<span #b>Span</span>, Title: {{ b.title }}',
			})
			class App {}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			expect(el.innerText).to.be.equal('Span, Title: Cool span');
		});

		it('should export selected directive into parent component', () => {
			@Directive({
				selector: 'span',
			})
			class One {
				title = 'First';
			}

			@Directive({
				selector: 'span',
			})
			class Two {
				title = 'Second';
			}

			@Component({
				selector: 'app',
				controllerAs: 'app',
				directives: [One, Two],
				template: '<span #a="One" #b="Two">Span</span>, A: {{ a.title }}, B: {{ b.title }}',
			})
			class App {}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			expect(el.innerText).to.be.equal('Span, A: First, B: Second');
		});

		it('should import root component into another root component input', (done) => {
			@Component({
				selector: 'a',
				template: '',
			})
			class A {}

			@Component({
				selector: 'b',
				template: '',
			})
			class B implements OnInit {
				@Input()
				a;
				onInit() {
					expect(this.a).to.be.an.instanceof(A);
					done();
				}
			}

			let el = Dom.el('<div><a #first></a><b [a]="first"></b></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [A, B]);

			compiler.compile(view, A);
			compiler.compile(view, B);
		});

		it('should import root directive into root component input', (done) => {
			@Directive({
				selector: 'a',
			})
			class A {}

			@Component({
				selector: 'b',
				template: '',
			})
			class B implements OnInit {
				@Input()
				a;
				onInit() {
					expect(this.a).to.be.an.instanceof(A);
					done();
				}
			}

			let el = Dom.el('<div><a #first></a><b [a]="first"></b></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [A, B]);

			compiler.compile(view, A);
			compiler.compile(view, B);
		});

		it('should throw an error when trying to use template with non ID selector', () => {
			@Component({
				selector: 'app',
				template: '<content select=".tmpl"></content>'
			})
			class App {}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			expect(() => {
				compiler.compile(view, App);
			}).to.throw(Error, 'Can not include template by selector ".tmpl". The only supported selector in <content> is ID attribute.');
		});

		it('should throw an error when trying to use not registered template', () => {
			@Component({
				selector: 'app',
				template: '<content select="#find-me"></content>'
			})
			class App {}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			expect(() => {
				compiler.compile(view, App);
			}).to.throw(Error, 'Can not find template with ID "find-me".');
		});

		it('should use template with content tag', () => {
			@Component({
				selector: 'app',
				template:
					'<template id="tmpl">' +
						'text<!-- comment --><span>element</span>' +
					'</template>' +
					'<content select="#tmpl"></content>' +
					'<content select="#tmpl"></content>'
			})
			class App {}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			expect(el.innerHTML).to.be.equal('<app><!-- -slicky--data- -->text<!-- comment --><span>element</span>text<!-- comment --><span>element</span></app>');
		});

		it('should use template and pass some additional parameters', () => {
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
			class App {
				prefix = 'a-';
				postfix = '-a';
			}

			let el = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App]);

			compiler.compile(view, App);

			expect(el.innerText).to.be.equal('Item: 1/a-first-a, Item: 2/a-second-a, Item: 3/a-third-a');
		});

	});

});
