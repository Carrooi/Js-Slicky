import {Compiler} from '../../src/Compiler';
import {OnInit} from '../../src/Interfaces';
import {Container} from '../../di';
import {Dom} from '../../src/Util/Dom';
import {Application, Component, Input} from '../../core';
import {View} from '../../src/Views/View';
import {IfDirective} from '../../src/Directives/IfDirective';
import {ForDirective} from '../../src/Directives/ForDirective';
import {ElementRef} from '../../src/Templating/ElementRef';
import {Filter} from '../../src/Templating/Filters/Metadata';
import {Directive} from '../../src/Entity/Metadata';
import {ControllerView} from '../../src/Entity/ControllerView';


import chai = require('chai');


let expect = chai.expect;

let application: Application = null;
let compiler: Compiler = null;


describe('#Compiler/template', () => {

	beforeEach(() => {
		let container = new Container;
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

			let parent = document.createElement('div');
			parent.innerHTML = '<div test></div>';

			let el = <HTMLDivElement>parent.children[0];

			compiler.compile(new View(new ElementRef(parent)), Test);

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

			let parent = document.createElement('div');
			parent.innerHTML = '<div test></div>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			let el = <HTMLDivElement>parent.children[0];

			compiler.compile(view, Test);
			view.watcher.run();

			expect(el.innerHTML).to.be.equal('days: 2');

			setTimeout(() => {
				expect(el.innerHTML).to.be.equal('days: 1');
				done();
			}, 200);
		});

		it('should update property in attribute', (done) => {
			@Component({
				selector: '[test]',
				template: '<span class="{{ alertType }}"></span>',
			})
			class Test {}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test></div>';

			let el = <HTMLDivElement>parent.children[0];

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.parameters['alertType'] = 'success';

			compiler.compile(view, Test);
			view.watcher.run();

			let innerView = view.children[0].children[0];

			setTimeout(() => {
				expect((<HTMLElement>el.children[0]).className).to.be.equal('success');

				innerView.parameters['alertType'] = 'danger';

				setTimeout(() => {
					expect((<HTMLElement>el.children[0]).className).to.be.equal('danger');
					done();
				}, 200);
			}, 200);
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

			let el = document.createElement('div');
			el.innerHTML = '<div parent></div>';

			compiler.compile(new View(new ElementRef(el)), Parent);

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

			let parent = document.createElement('div');
			parent.innerHTML = '<div parent></div>';

			compiler.compile(new View(new ElementRef(parent)), Parent);

			let parentEl = <HTMLDivElement>parent.children[0];
			let childEl = parentEl.children[0];

			let view: View = ElementRef.getByNode(childEl).view;

			expect((<ControllerView>view.entities[0]).instance.parent).to.be.an.instanceof(Parent);
		});

		it('should throw an error when trying to add unknown property', () => {
			@Component({
				selector: '[app]',
			})
			class App {}

			let parent = document.createElement('div');
			parent.innerHTML = '<div app [unknown-prop]="a"></div>';

			expect(() => {
				compiler.compile(new View(new ElementRef(parent)), App);
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

			let el = document.createElement('div');
			el.innerHTML = '<div test></div>';

			compiler.compile(new View(new ElementRef(el)), Test);

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

			let el = document.createElement('div');
			el.innerHTML = '<div test></div>';

			compiler.compile(new View(new ElementRef(el)), Test);

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

			let parent = document.createElement('div');
			parent.innerHTML = '<div test></div>';

			compiler.compile(new View(new ElementRef(parent)), TestComponent);

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

			let el = document.createElement('div');
			el.innerHTML = '<div test></div>';

			compiler.compile(new View(new ElementRef(el)), Test);

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

			let el = document.createElement('div');
			el.innerHTML = '<div test></div>';

			compiler.compile(new View(new ElementRef(el)), Test);

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

			let el = document.createElement('div');
			el.innerHTML = '<app></app>';

			compiler.compile(new View(new ElementRef(el)), App);

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

			let el = document.createElement('div');
			el.innerHTML = '<div root></div>';

			compiler.compile(new View(new ElementRef(el)), Root);

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

			let parent = document.createElement('div');
			parent.innerHTML = '<div app>num: {{ app.num }} / <div test></div></div>';

			let el = <HTMLDivElement>parent.children[0];

			compiler.compile(new View(new ElementRef(parent)), Main);

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

			let parent = document.createElement('div');
			parent.innerHTML = '<div app>num: {{ app.num }} / <div test>num: {{ app.num / test.num }}</div></div>';

			let el = <HTMLDivElement>parent.children[0];

			compiler.compile(new View(new ElementRef(parent)), Main);

			expect(el.innerText).to.be.equal('num: 20 / num: 4');
		});

		it('should set component input with upper cased name', (done) => {
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

			let parent = document.createElement('div');
			parent.innerHTML = '<div app><div test [upperCasedInput]="a"></div></div>';

			var view = new View(new ElementRef(parent), {a: 'hello'});

			compiler.compile(view, Main);
			view.watcher.run();

			let innerView = <View>view.children[0].children[0];
			let component: Test = (<any>innerView.entities[0]).instance;

			expect(component.upperCasedInput).to.be.equal('hello');

			innerView.parameters['a'] = 'bye';

			setTimeout(() => {
				expect(component.upperCasedInput).to.be.equal('bye');
				done();
			}, 100);
		});

		it('should update component\'s input', (done) => {
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

			let parent = document.createElement('div');
			parent.innerHTML = '<div app><div test [input]="a"></div></div>';

			var view = new View(new ElementRef(parent), {a: 'hello'});

			compiler.compile(view, Main);
			view.watcher.run();

			let innerView = <View>view.children[0].children[0];
			let component: Test = (<any>innerView.entities[0]).instance;

			expect(component.input).to.be.equal('hello');

			innerView.parameters['a'] = 'bye';

			setTimeout(() => {
				expect(component.input).to.be.equal('bye');
				done();
			}, 100);
		});

		it('should not compile template', () => {
			@Component({
				selector: '[test]',
			})
			class Test {}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test><template>hello</template></div>';

			let view = new View(new ElementRef(parent));

			compiler.compile(view, Test);

			expect(parent.innerText).to.be.equal('');
			expect(view.children).to.have.length(1);
			expect(view.children[0].children).to.have.length(1);
			expect((<View>view.children[0].children[0]).el).to.be.an.instanceof(ElementRef);
			expect((<HTMLElement>(<View>view.children[0].children[0]).el.nativeEl).innerHTML).to.be.equal('hello');
		});

		it('should transform shortcut templates to full html templates', () => {
			@Component({
				selector: '[test]',
			})
			class Test {}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test><span *first="1" *second="2" *third="3">hello</span></div>';

			let view = new View(new ElementRef(parent));

			compiler.compile(view, Test);

			expect(parent.innerText).to.be.equal('');
			expect(view.children).to.have.length(1);
			expect(view.children[0].children).to.have.length(1);
			expect((<HTMLElement>(<View>view.children[0].children[0]).el.nativeEl.childNodes[0].childNodes[0]).innerHTML).to.be.equal('<span>hello</span>');
		});

		it('should add inner text from template with if directive', (done) => {
			@Component({
				selector: 'app',
				directives: [IfDirective],
				template: '<template [s:if]="true">hello</template>',
			})
			class App {}

			let parent = document.createElement('div');
			parent.innerHTML = '<app></app>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			compiler.compile(view, App);

			setTimeout(() => {
				expect(parent.innerText).to.be.equal('hello');
				done();
			}, 100);
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

			let parent = document.createElement('div');
			parent.innerHTML = '<app></app>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			compiler.compile(view, App);
			view.watcher.run();

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

			let parent = document.createElement('div');
			parent.innerHTML = '<app></app>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.parameters['a'] = 'hello';

			compiler.compile(view, App);
			view.watcher.run();

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

			let parent = document.createElement('div');
			parent.innerHTML = '<app></app>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.parameters['list'] = ['hello'];

			compiler.compile(view, App);
			view.watcher.run();

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

			let parent = document.createElement('div');
			parent.innerHTML = '<app></app>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			compiler.compile(view, App);
			view.watcher.run();

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

			let parent = document.createElement('div');
			parent.innerHTML = '<app></app>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			compiler.compile(view, App);
			view.watcher.run();

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

			let parent = document.createElement('div');
			parent.innerHTML = '<app></app>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.parameters['items'] = ['a', 'b'];

			expect(() => {
				compiler.compile(view, App);
			}).to.throw(Error, 'Can not import variable item since its already in use.');
		});

	});

});
