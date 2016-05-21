import {Compiler} from '../../src/Compiler';
import {OnDestroy} from '../../src/Interfaces';
import {Container} from '../../di';
import {Dom} from '../../src/Util/Dom';
import {Application, Component, Input, HostEvent, HostElement, Required} from '../../core';
import {View} from '../../src/Views/View';
import {ElementRef} from '../../src/Templating/ElementRef';
import {ControllerView} from '../../src/Entity/ControllerView';


import chai = require('chai');


let expect = chai.expect;

let application: Application = null;
let compiler: Compiler = null;


describe('#Compiler', () => {

	beforeEach(() => {
		let container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	describe('compile()', () => {

		it('should compile element', () => {
			@Component({selector: '[test]'})
			class Test {}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test></div>';

			let el = parent.children[0];

			compiler.compile(new View(new ElementRef(parent)), Test);

			let view: View = ElementRef.getByNode(el).view;

			expect(view.entities).to.have.length(1);
			expect((<ControllerView>view.entities[0]).instance).to.be.an.instanceOf(Test);
		});

		it('should call onUnbind method on controller', () => {
			let called = false;

			@Component({selector: '[test]'})
			class Test implements OnDestroy {
				onDestroy() {
					called = true;
				}
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test></div>';

			let view = new View(new ElementRef(parent));

			compiler.compile(view, Test);

			view.detach();

			expect(called).to.be.equal(true);
		});

		it('should set template', () => {
			@Component({selector: '[test]', template: 'lorem ipsum'})
			class Test {}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test></div>';

			let el = <HTMLDivElement>parent.children[0];

			compiler.compile(new View(new ElementRef(parent)), Test);

			expect(el.innerHTML).to.be.equal('lorem ipsum');
		});

		it('should load input', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				public input1: string;
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test [input1]="\'hello\'"></div>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.directives.push(Test);

			compiler.compileElement(view, parent);

			let innerView = <View>view.children[0];

			expect(innerView.entities).to.have.length(1);

			let test = <Test>(<ControllerView>innerView.entities[0]).instance;

			expect(test.input1).to.be.equal('hello');
		});

		it('should load input from simple attribute', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				public test: string;
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test="hello"></div>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.directives.push(Test);

			compiler.compileElement(view, parent);

			let innerView = <View>view.children[0];

			expect(innerView.entities).to.have.length(1);

			let test = <Test>(<ControllerView>innerView.entities[0]).instance;

			expect(test.test).to.be.equal('hello');
		});

		it('should load input with different name', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input('data-input1')
				public input1: string;
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test [data-input1]="\'hello\'"></div>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.directives.push(Test);

			compiler.compileElement(view, parent);

			let innerView = <View>view.children[0];

			expect(innerView.entities).to.have.length(1);

			let test = <Test>(<ControllerView>innerView.entities[0]).instance;

			expect(test.input1).to.be.equal('hello');
		});

		it('should not load input', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				public input1: string;
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test></div>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.directives.push(Test);

			compiler.compileElement(view, parent);

			let innerView = <View>view.children[0];

			expect(innerView.entities).to.have.length(1);

			let test = <Test>(<ControllerView>innerView.entities[0]).instance;

			expect(test.input1).to.be.equal(undefined);
		});

		it('should not load input and use default value', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				public input1: string = 'bye';
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test></div>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.directives.push(Test);

			compiler.compileElement(view, parent);

			let innerView = <View>view.children[0];

			expect(innerView.entities).to.have.length(1);

			let test = <Test>(<ControllerView>innerView.entities[0]).instance;

			expect(test.input1).to.be.equal('bye');
		});

		it('should load required input', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				@Required()
				public input;
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test [input]="\'hello\'"></div>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.directives.push(Test);

			compiler.compileElement(view, parent);

			let innerView = <View>view.children[0];

			expect(innerView.entities).to.have.length(1);

			let test = <Test>(<ControllerView>innerView.entities[0]).instance;

			expect(test.input).to.be.equal('hello');
		});

		it('should throw an error for required input', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				@Required()
				public input;
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test></div>';

			expect(() => {
				compiler.compile(new View(new ElementRef(parent)), Test);
			}).to.throw(Error, "Component's input Test::input was not found in div element.");
		});

		it('should load itself as an element', () => {
			@Component({selector: '[test]'})
			class Test {
				@HostElement()
				public el;
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test></div>';

			let el = parent.children[0];

			compiler.compile(new View(new ElementRef(parent)), Test);

			let view: View = ElementRef.getByNode(el).view;

			expect(view.entities).to.have.length(1);

			let test = <Test>(<ControllerView>view.entities[0]).instance;

			expect(test.el).to.be.equal(el);
		});

		it('should load child element', () => {
			@Component({selector: '[test]'})
			class Test {
				@HostElement('span')
				public child;
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test><span>hello</span></div>';

			let el = parent.children[0];

			compiler.compile(new View(new ElementRef(parent)), Test);

			let view: View = ElementRef.getByNode(el).view;

			expect(view.entities).to.have.length(1);

			let test = <Test>(<ControllerView>view.entities[0]).instance;

			expect(test.child.nodeName.toLowerCase()).to.be.equal('span');
			expect(test.child.innerHTML).to.be.equal('hello');
		});

		it('should call event on main element', (done) => {
			let called = 0;

			@Component({selector: '[test]'})
			class Test {
				@HostEvent('click')
				public onClick() {
					called++;
				}
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test></div>';

			let el = parent.children[0];

			compiler.compile(new View(new ElementRef(parent)), Test);

			el.dispatchEvent(Dom.createMouseEvent('click'));

			setTimeout(() => {
				expect(called).to.be.equal(1);
				done();
			}, 100);
		});

		it('should call event on child element', (done) => {
			let called = 0;

			@Component({selector: '[test]'})
			class Test {
				@HostEvent('a', 'click')
				public onClick() {
					called++;
				}
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test><a href="#"></a></div>';

			let link = parent.querySelector('a');

			compiler.compile(new View(new ElementRef(parent)), Test);

			link.dispatchEvent(Dom.createMouseEvent('click'));

			setTimeout(() => {
				expect(called).to.be.equal(1);
				done();
			}, 100);
		});

		it('should call event on attached child element', (done) => {
			let called = 0;

			@Component({selector: '[test]'})
			class Test {
				@HostElement('a')
				public btn;

				@HostEvent('@btn', 'click')
				public onClick() {
					called++;
				}
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test><a href="#"></a></div>';

			let link = parent.querySelector('a');

			compiler.compile(new View(new ElementRef(parent)), Test);

			link.dispatchEvent(Dom.createMouseEvent('click'));

			setTimeout(() => {
				expect(called).to.be.equal(1);
				done();
			}, 100);
		});

		it('should pass View and ElementRef to controller', () => {
			let currentView: View = null;
			let currentElementRef: ElementRef = null;

			@Component({
				selector: '[test]',
			})
			class Test {
				constructor(view: View, el: ElementRef) {
					currentView = view;
					currentElementRef = el;
				}
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<div test></div>';

			compiler.compile(new View(new ElementRef(parent)), Test);

			expect(currentView).to.be.an.instanceof(View);
			expect(currentElementRef).to.be.an.instanceof(ElementRef);
			expect(currentElementRef.nativeEl).to.be.equal(parent.children[0]);
		});

		it('should initialize component just once', () => {
			let calledApp = 0;
			let calledOuter = 0;
			let calledInner = 0;

			@Component({
				selector: '[inner]',
			})
			class Inner {
				constructor() {
					calledInner++;
				}
			}

			@Component({
				selector: '[outer]',
			})
			class Outer {
				constructor() {
					calledOuter++;
				}
			}

			@Component({
				selector: '[app]',
				directives: [Outer, Inner],
			})
			class App {
				constructor() {
					calledApp++;
				}
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<div app><div outer><div inner></div></div></div>';

			compiler.compile(new View(new ElementRef(parent)), App);

			expect(calledApp).to.be.equal(1);
			expect(calledOuter).to.be.equal(1);
			expect(calledInner).to.be.equal(1);
		});

		it('should initialize inner component for many parents just once', () => {
			let calledApp = 0;
			let calledParentOne = 0;
			let calledParentTwo = 0;
			let calledChild = 0;

			@Component({
				selector: '[child]',
			})
			class Child {
				constructor() {
					calledChild++;
				}
			}

			@Component({
				selector: '[parent-one]',
			})
			class ParentOne {
				constructor() {
					calledParentOne++;
				}
			}

			@Component({
				selector: '[parent-two]',
			})
			class ParentTwo {
				constructor() {
					calledParentTwo++;
				}
			}

			@Component({
				selector: '[app]',
				directives: [ParentOne, ParentTwo, Child],
			})
			class App {
				constructor() {
					calledApp++;
				}
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<div app><div parent-one parent-two><div child></div></div></div>';

			compiler.compile(new View(new ElementRef(parent)), App);

			expect(calledApp).to.be.equal(1);
			expect(calledParentOne).to.be.equal(1);
			expect(calledParentTwo).to.be.equal(1);
			expect(calledChild).to.be.equal(1);
		});

	});

});
