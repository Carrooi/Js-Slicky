import {
	Application, Compiler,
	ComponentView, ApplicationView,
	ElementRef,
	Component,
	HostEvent, HostElement,
	OnDestroy,
	Input, Required
} from '../../core';
import {Container} from '../../di';
import {Dom} from '../../utils';
import {MockView} from '../mocks/MockView';


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

			let parent = Dom.el('<div><div test></div></div>');
			let el = parent.children[0];

			compiler.compile(new ApplicationView(parent, Test));

			let view: ComponentView = ElementRef.getByNode(el).view;

			expect(view.component.instance).to.be.an.instanceOf(Test);
		});

		it('should call onUnbind method on controller', () => {
			let called = false;

			@Component({selector: '[test]'})
			class Test implements OnDestroy {
				onDestroy() {
					called = true;
				}
			}

			let parent = Dom.el('<div><div test></div></div>');
			let view = new ApplicationView(parent, Test);

			compiler.compile(view);

			view.detach();

			expect(called).to.be.equal(true);
		});

		it('should set template', () => {
			@Component({selector: '[test]', template: 'lorem ipsum'})
			class Test {}

			let parent = Dom.el('<div><div test></div></div>');
			let el = <HTMLDivElement>parent.children[0];

			compiler.compile(new ApplicationView(parent, Test));

			expect(el.innerHTML).to.be.equal('lorem ipsum');
		});

		it('should load input', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				public input1: string;
			}

			let parent = Dom.el('<div><div test [input1]="\'hello\'"></div></div>');
			let elementRef = ElementRef.getByNode(parent);
			let view = new ComponentView(new MockView, elementRef);

			view.directives.push(Test);

			compiler.compileElement(view, parent);

			let innerView = <ComponentView>view.children[0];
			let test = <Test>innerView.component.instance;

			expect(test.input1).to.be.equal('hello');
		});

		it('should load input from simple attribute', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				public test: string;
			}

			let parent = Dom.el('<div><div test="hello"></div></div>');
			let elementRef = ElementRef.getByNode(parent);
			let view = new ComponentView(new MockView, elementRef);

			view.directives.push(Test);

			compiler.compileElement(view, parent);

			let innerView = <ComponentView>view.children[0];
			let test = <Test>innerView.component.instance;

			expect(test.test).to.be.equal('hello');
		});

		it('should load input with different name', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input('data-input1')
				public input1: string;
			}

			let parent = Dom.el('<div><div test [data-input1]="\'hello\'"></div></div>');
			let elementRef = ElementRef.getByNode(parent);
			let view = new ComponentView(new MockView, elementRef);

			view.directives.push(Test);

			compiler.compileElement(view, parent);

			let innerView = <ComponentView>view.children[0];
			let test = <Test>innerView.component.instance;

			expect(test.input1).to.be.equal('hello');
		});

		it('should not load input', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				public input1: string;
			}

			let parent = Dom.el('<div><div test></div></div>');
			let elementRef = ElementRef.getByNode(parent);
			let view = new ComponentView(new MockView, elementRef);

			view.directives.push(Test);

			compiler.compileElement(view, parent);

			let innerView = <ComponentView>view.children[0];
			let test = <Test>innerView.component.instance;

			expect(test.input1).to.be.equal(undefined);
		});

		it('should not load input and use default value', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				public input1: string = 'bye';
			}

			let parent = Dom.el('<div><div test></div></div>');
			let elementRef = ElementRef.getByNode(parent);
			let view = new ComponentView(new MockView, elementRef);

			view.directives.push(Test);

			compiler.compileElement(view, parent);

			let innerView = <ComponentView>view.children[0];
			let test = <Test>innerView.component.instance;

			expect(test.input1).to.be.equal('bye');
		});

		it('should load required input', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				@Required()
				public input;
			}

			let parent = Dom.el('<div><div test [input]="\'hello\'"></div></div>');
			let elementRef = ElementRef.getByNode(parent);
			let view = new ComponentView(new MockView, elementRef);

			view.directives.push(Test);

			compiler.compileElement(view, parent);

			let innerView = <ComponentView>view.children[0];
			let test = <Test>innerView.component.instance;

			expect(test.input).to.be.equal('hello');
		});

		it('should throw an error for required input', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				@Required()
				public input;
			}

			let parent = Dom.el('<div><div test></div></div>');

			expect(() => {
				compiler.compile(new ApplicationView(parent, Test));
			}).to.throw(Error, "Component's input Test::input was not found in div element.");
		});

		it('should load itself as an element', () => {
			@Component({selector: '[test]'})
			class Test {
				@HostElement()
				public el;
			}

			let parent = Dom.el('<div><div test></div></div>');
			let el = parent.children[0];

			compiler.compile(new ApplicationView(parent, Test));

			let view: ComponentView = ElementRef.getByNode(el).view;
			let test = <Test>view.component.instance;

			expect(test.el).to.be.equal(el);
		});

		it('should load child element', () => {
			@Component({selector: '[test]'})
			class Test {
				@HostElement('span')
				public child;
			}

			let parent = Dom.el('<div><div test><span>hello</span></div></div>');
			let el = parent.children[0];

			compiler.compile(new ApplicationView(parent, Test));

			let view: ComponentView = ElementRef.getByNode(el).view;
			let test = <Test>view.component.instance;

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

			let parent = Dom.el('<div><div test></div></div>');
			let el = parent.children[0];

			compiler.compile(new ApplicationView(parent, Test));

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

			let parent = Dom.el('<div><div test><a href="#"></a></div></div>');
			let link = parent.querySelector('a');

			compiler.compile(new ApplicationView(parent, Test));

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

			let parent = Dom.el('<div><div test><a href="#"></a></div></div>');
			let link = parent.querySelector('a');

			compiler.compile(new ApplicationView(parent, Test));

			link.dispatchEvent(Dom.createMouseEvent('click'));

			setTimeout(() => {
				expect(called).to.be.equal(1);
				done();
			}, 100);
		});

		it('should pass View and ElementRef to controller', () => {
			let currentView: ComponentView = null;
			let currentElementRef: ElementRef = null;

			@Component({
				selector: '[test]',
			})
			class Test {
				constructor(view: ComponentView, el: ElementRef) {
					currentView = view;
					currentElementRef = el;
				}
			}

			let parent = Dom.el('<div><div test></div></div>');

			compiler.compile(new ApplicationView(parent, Test));

			expect(currentView).to.be.an.instanceof(ComponentView);
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

			let parent = Dom.el('<div><div app><div outer><div inner></div></div></div></div>');

			compiler.compile(new ApplicationView(parent, App));

			expect(calledApp).to.be.equal(1);
			expect(calledOuter).to.be.equal(1);
			expect(calledInner).to.be.equal(1);
		});

		it('should not allow to attach more than 1 component to element', () => {
			@Component({
				selector: '[one]',
			})
			class One {}

			@Component({
				selector: '[two]',
			})
			class Two {}

			@Component({
				selector: '[app]',
				directives: [One, Two],
			})
			class App {}

			let parent = Dom.el('<div><div app><div one two></div></div></div>');

			expect(() => {
				compiler.compile(new ApplicationView(parent, App));
			}).to.throw(Error, 'Can\'t attach component "Two" to element "div" since it\'s already attached to component "One".');
		});

	});

});
