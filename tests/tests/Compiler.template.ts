import {Application, Compiler, ComponentView, ApplicationView, Component, Directive, HostEvent, ElementRef, Filter, Input, OnInit} from '../../core';
import {IfDirective, ForDirective} from '../../common';
import {Container} from '../../di';
import {Dom} from '../../utils';


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

		it('should set template', () => {
			@Component({
				selector: '[test]',
				controllerAs: 'test',
				template: 'days: {{ test.days }}',
			})
			class Test {
				public days: number = 2;
			}

			let parent = Dom.el('<div><div test></div></div>');
			let el = <HTMLDivElement>parent.children[0];

			compiler.compile(new ApplicationView(container, parent, Test));

			expect(el.innerHTML).to.be.equal('days: 2');
		});

		it('should update property in template', (done) => {
			@Component({
				selector: '[test]',
				controllerAs: 'test',
				template: 'days: {{ test.days }}',
			})
			class Test implements OnInit {
				public days: number = 2;
				onInit(): void
				{
					setTimeout(() => {
						this.days--;
					}, 50);
				}
			}

			let parent = Dom.el('<div><div test></div></div>');
			let view = new ApplicationView(container, parent, Test);
			let el = <HTMLDivElement>parent.children[0];

			compiler.compile(view);

			expect(el.innerHTML).to.be.equal('days: 2');

			setTimeout(() => {
				expect(el.innerHTML).to.be.equal('days: 1');
				done();
			}, 200);
		});

		it('should update property in attribute', () => {
			@Component({
				selector: '[test]',
				template: '<span class="{{ alertType }}"></span>',
			})
			class Test {}

			let parent = Dom.el('<div><div test></div></div>');
			let el = <HTMLDivElement>parent.children[0];
			let view = new ApplicationView(container, parent, Test);

			view.parameters['alertType'] = 'success';

			compiler.compile(view);

			let innerView = <ComponentView>view.children[0];

			expect((<HTMLElement>el.children[0]).className).to.be.equal('success');

			innerView.parameters['alertType'] = 'danger';
			innerView.changeDetectorRef.refresh();

			expect((<HTMLElement>el.children[0]).className).to.be.equal('danger');
		});

		it('should have access to parent component', () => {
			@Component({
				selector: '[child]',
				controllerAs: 'inner',
				template: "I'm {{ inner.type }} and my parent is {{ outer.type }}",
			})
			class Child {
				public type = 'inner';
			}

			@Component({
				selector: '[parent]',
				controllerAs: 'outer',
				template: "I'm {{ outer.type }} / <div child></div>",
				directives: [Child],
			})
			class Parent {
				public type = 'outer';
			}

			let el = Dom.el('<div><div parent></div></div>');

			compiler.compile(new ApplicationView(container, el, Parent));

			expect(el.innerText).to.be.equal("I'm outer / I'm inner and my parent is outer");
		});

		it('should use parent component as input', () => {
			@Component({
				selector: '[child]',
			})
			class Child {
				@Input('parent')
				public parent: Parent;
			}

			@Component({
				selector: '[parent]',
				controllerAs: 'outer',
				template: '<div child [parent]="outer"></div>',
				directives: [Child],
			})
			class Parent {}

			let parent = Dom.el('<div><div parent></div></div>');

			compiler.compile(new ApplicationView(container, parent, Parent));

			let parentEl = <HTMLDivElement>parent.children[0];
			let childEl = parentEl.children[0];

			let view: ComponentView = ElementRef.getByNode(childEl).view;

			expect(view.component.instance.parent).to.be.an.instanceof(Parent);
		});

		it('should throw an error when trying to add unknown property', () => {
			@Component({
				selector: '[app]',
			})
			class App {}

			let parent = Dom.el('<div><div app [unknown-prop]="a"></div></div>');

			expect(() => {
				compiler.compile(new ApplicationView(container, parent, App));
			}).to.throw(Error, 'Could not bind property unknown-prop to element div or to any of its directives.');
		});

		it('should call component event', (done) => {
			let called = 0;
			let calledScope = null;

			@Component({
				selector: '[test]',
				controllerAs: 'test',
				template: '<a href="#" (click)="test.onClick($event)"></a>',
			})
			class Test {
				public onClick(e: Event) {
					e.preventDefault();
					called++;
					calledScope = this;
				}
			}

			let el = Dom.el('<div><div test></div></div>');

			compiler.compile(new ApplicationView(container, el, Test));

			let link = el.querySelector('a');

			link.dispatchEvent(Dom.createMouseEvent('click'));

			setTimeout(() => {
				expect(called).to.be.equal(1);
				expect(calledScope).to.be.an.instanceof(Test);
				done();
			}, 100);
		});

		it('should have access to if directive', () => {
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

			compiler.compile(new ApplicationView(container, el, Test));

			expect(el.innerText).to.be.equal('1');
		});

		it('should have access to custom directive', () => {
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

			let parent = Dom.el('<div><div test></div></div>');

			compiler.compile(new ApplicationView(container, parent, TestComponent));

			expect(parent.innerText).to.be.equal('hello');
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

			compiler.compile(new ApplicationView(container, el, Test));

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

			compiler.compile(new ApplicationView(container, el, Test));

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

			compiler.compile(new ApplicationView(container, el, App));

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

			compiler.compile(new ApplicationView(container, el, Root));

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
			})
			class Main {
				public num = 20;
			}

			let parent = Dom.el('<div><div app>num: {{ app.num }} / <div test></div></div></div>');
			let el = <HTMLDivElement>parent.children[0];

			compiler.compile(new ApplicationView(container, parent, Main));

			expect(el.innerText).to.be.equal('num: 20 / num: 4');
		});

		it('should compile components inside of main components without custom template', () => {
			@Component({
				selector: '[test]',
				controllerAs: 'test',
			})
			class Test {
				public num = 5;
			}

			@Component({
				selector: '[app]',
				controllerAs: 'app',
				directives: [Test],
			})
			class Main {
				public num = 20;
			}

			let parent = Dom.el('<div><div app>num: {{ app.num }} / <div test>num: {{ app.num / test.num }}</div></div></div>');
			let el = <HTMLDivElement>parent.children[0];

			compiler.compile(new ApplicationView(container, parent, Main));

			expect(el.innerText).to.be.equal('num: 20 / num: 4');
		});

		it('should set component input with upper cased name', () => {
			@Component({
				selector: '[test]',
			})
			class Test {
				@Input() upperCasedInput;
			}

			@Component({
				selector: '[app]',
				directives: [Test],
			})
			class Main {}

			let parent = Dom.el('<div><div app><div test [upperCasedInput]="a"></div></div></div>');
			var view = new ApplicationView(container, parent, Main, {a: 'hello'});

			compiler.compile(view);

			let innerView = <ComponentView>view.children[0].children[0];
			let component: Test = innerView.component.instance;

			expect(component.upperCasedInput).to.be.equal('hello');

			innerView.parameters['a'] = 'bye';
			innerView.changeDetectorRef.refresh();

			expect(component.upperCasedInput).to.be.equal('bye');
		});

		it('should update component\'s input', () => {
			@Component({
				selector: '[test]',
			})
			class Test {
				@Input() input;
			}

			@Component({
				selector: '[app]',
				directives: [Test],
			})
			class Main {}

			let parent = Dom.el('<div><div app><div test [input]="a"></div></div></div>');
			var view = new ApplicationView(container, parent, Main, {a: 'hello'});

			compiler.compile(view);

			let innerView = <ComponentView>view.children[0].children[0];
			let component: Test = innerView.component.instance;

			expect(component.input).to.be.equal('hello');

			innerView.parameters['a'] = 'bye';
			innerView.changeDetectorRef.refresh();

			expect(component.input).to.be.equal('bye');
		});

		it('should add inner text from template with if directive', (done) => {
			@Component({
				selector: 'app',
				directives: [IfDirective],
				template: '<template [s:if]="true">hello</template>',
			})
			class App {}

			let parent = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, parent, App);

			compiler.compile(view);

			setTimeout(() => {
				expect(parent.innerText).to.be.equal('hello');
				done();
			}, 100);
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
				template: '<button (click)="btn.click()">{{ btn.title }}</button>',
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
			let view = new ApplicationView(container, el, Button);

			compiler.compile(view);

			expect(el.innerText).to.be.equal('Click');

			setTimeout(() => {
				expect(el.innerText).to.be.equal('Please, click');
				done();
			}, 50);
		});

		it('should compile component with for directive', (done) => {
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

			let parent = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, parent, App);

			compiler.compile(view);

			setTimeout(() => {
				expect(parent.innerText).to.be.equal('a, b, c, ');
				done();
			}, 100);
		});

		it('should attach variable to inner component', (done) => {
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

			let parent = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, parent, App);

			view.parameters['a'] = 'hello';

			compiler.compile(view);

			setTimeout(() => {
				expect(parent.innerText).to.be.equal('hello world');
				done();
			}, 200);
		});

		it('should attach new variable to inner component', (done) => {
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

			let parent = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, parent, App);

			view.parameters['list'] = ['hello'];

			compiler.compile(view);

			setTimeout(() => {
				expect(parent.innerText).to.be.equal('hello world');
				done();
			}, 200);
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

			let parent = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, parent, App);

			compiler.compile(view);

			setTimeout(() => {
				expect(parent.innerText).to.be.equal('abc');
				done();
			}, 200);
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

			let parent = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, parent, App);

			compiler.compile(view);

			setTimeout(() => {
				expect(parent.innerText).to.be.equal('abc');
				done();
			}, 200);
		});

		it('should throw an error when trying to rewrite already used variable', () => {
			@Component({
				selector: '[item]',
				controllerAs: 'item',
				template: '{{ item.item }}',
			})
			class Item {
				@Input('data')
				item;
			}

			@Component({
				selector: 'app',
				directives: [ForDirective, Item],
				template: '<span *s:for="#item in items" item [data]="item"></span>',
			})
			class App {}

			let parent = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, parent, App);

			view.parameters['items'] = ['a', 'b'];

			expect(() => {
				compiler.compile(view);
			}).to.throw(Error, 'Can not import variable item since its already in use.');
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

			let parent = Dom.el('<div><app></app></div>');
			let view = new ApplicationView(container, parent, App);

			compiler.compile(view);

			let appView = <ComponentView>view.children[0];

			expect(parent.innerText).to.be.equal('hello world');

			appView.parameters['app'].obj = {a: 'hi'};
			appView.changeDetectorRef.refresh();

			expect(parent.innerText).to.be.equal('hi');
		});

		it('should pass json into component input', () => {
			@Component({
				selector: 'app',
			})
			class App {
				@Input()
				data = null;
			}

			let parent = Dom.el('<div><app [data]=\'{"a.b.c": "hello"}\'></app></div>');
			let view = new ApplicationView(container, parent, App);

			view.parameters = {a: 'test'};

			compiler.compile(view);

			let appView = <ComponentView>view.children[0];
			let app = <App>appView.component.instance;

			expect(app.data).to.be.eql({'a.b.c': 'hello'});
		});

	});

});
