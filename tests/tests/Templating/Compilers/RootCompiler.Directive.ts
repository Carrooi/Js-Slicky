import {Dom} from '../../../../src/Util/Dom';
import {ElementRef} from '../../../../src/Templating/ElementRef';
import {OnInit, OnUpdate} from '../../../../src/Interfaces';
import {Directive, HostElement, Input, Required, HostEvent} from '../../../../src/Entity/Metadata';

import {processDirective} from '../../_testHelpers';


import chai = require('chai');


let expect = chai.expect;
let parent: HTMLDivElement;


describe('#Templating/Compilers/RootCompiler.Directive', () => {

	beforeEach(() => {
		parent = document.createElement('div');
	});

	describe('processDirective()', () => {

		it('should include simple directive', () => {
			let called = false;

			@Directive({
				selector: 'directive',
			})
			class TestDirective implements OnInit {
				constructor(private el: ElementRef) {}
				onInit() {
					expect(this.el).to.be.an.instanceOf(ElementRef);

					called = true;
				}
			}

			processDirective(parent, TestDirective);

			expect(called).to.be.equal(true);
		});

		it('should throw an error when host element does not exists', () => {
			@Directive({
				selector: 'directive',
			})
			class TestDirective {
				@HostElement('button') btn;
			}

			expect(() => {
				processDirective(parent, TestDirective);
			}).to.throw(Error, 'TestDirective.btn: could not import host element "button". Element does not exists.');
		});

		it('should throw an error when host element overflow directive boundary', () => {
			@Directive({
				selector: 'directive',
			})
			class TestDirective {
				@HostElement('directive > button') btn;
			}

			expect(() => {
				processDirective(parent, TestDirective);
			}).to.throw(Error, 'TestDirective.btn: could not import host element "directive > button". Element does not exists.');
		});

		it('should include host elements', () => {
			let called = false;

			@Directive({
				selector: 'directive',
			})
			class TestDirective implements OnInit {
				@HostElement() div: ElementRef;
				@HostElement('button') btn: ElementRef;
				@HostElement('div > span') title: ElementRef;
				constructor(private el: ElementRef) {}
				onInit() {
					called = true;

					expect(this.div).to.be.an.instanceOf(ElementRef);
					expect(this.div.nativeElement).to.be.an.instanceOf(HTMLDivElement);
					expect(this.div).to.be.equal(this.el);

					expect(this.btn).to.be.an.instanceOf(ElementRef);
					expect(this.btn.nativeElement).to.be.an.instanceOf(HTMLButtonElement);
					expect(this.btn.nativeElement.innerText).to.be.equal('Click');

					expect(this.title).to.be.an.instanceOf(ElementRef);
					expect(this.title.nativeElement).to.be.an.instanceOf(HTMLSpanElement);
					expect(this.title.nativeElement.innerText).to.be.equal('hello');
				}
			}

			parent.innerHTML = '<button>Click</button><div><span>hello</span></div>';

			processDirective(parent, TestDirective);

			expect(called).to.be.equal(true);
		});

		it('should import all inputs', () => {
			let called = false;
			let calledUpdate = 0;
			let scope = {
				prop: 'property',
				attr: 'attribute',
			};

			@Directive({
				selector: 'directive',
			})
			class TestDirective implements OnInit, OnUpdate {
				@Input() property;
				@Input('attributeCustom') attribute;
				@Input() simpleAttribute;
				@Input() withDefault = 'default value';
				onInit() {
					called = true;

					expect(this.property).to.be.equal(scope.prop);
					expect(this.attribute).to.be.equal(scope.attr);
					expect(this.simpleAttribute).to.be.equal('simple');
					expect(this.withDefault).to.be.equal('default value');
				}
				onUpdate(prop: string, value: any)
				{
					calledUpdate++;

					expect(prop).to.be.oneOf(['property', 'attribute']);

					if (prop === 'property') {
						expect(value).to.be.equal(scope.prop);
					} else {
						expect(value).to.be.equal(scope.attr);
					}
				}
			}

			parent.innerHTML = '<directive [property]="prop" attribute-custom="{{ attr }}" simple-attribute="simple"></directive>';

			processDirective(<HTMLElement>parent.children[0], TestDirective, scope);

			expect(called).to.be.equal(true);
		});

		it('should throw an error when required input does not exists', () => {
			@Directive({
				selector: 'directive',
			})
			class TestDirective {
				@Input() @Required() input;
			}

			expect(() => {
				processDirective(parent, TestDirective);
			}).to.throw(Error, 'TestDirective.input: could not find any suitable input in "div" element.');
		});

		it('should call host event on itself', (done) => {
			@Directive({
				selector: 'button',
			})
			class TestDirective {
				constructor(private el: ElementRef) {}
				@HostEvent('click')
				onClick(e: Event, btn: ElementRef) {
					expect(e).to.be.an.instanceOf(Event);
					expect(btn).to.be.equal(this.el);

					done();
				}
			}

			parent.innerHTML = '<button></button>';

			processDirective(<HTMLElement>parent.children[0], TestDirective);

			parent.children[0].dispatchEvent(Dom.createMouseEvent('click'));
		});

		it('should throw an error when host event element does not exists', () => {
			@Directive({
				selector: 'directive',
			})
			class TestDirective {
				@HostEvent('button', 'click')
				onClick() {}
			}

			expect(() => {
				processDirective(parent, TestDirective);
			}).to.throw(Error, 'TestDirective.onClick: could not bind "click" event to element "button". Element does not exists.');
		});

		it('should throw an error when adding host event to not existing host element', () => {
			@Directive({
				selector: 'directive',
			})
			class TestDirective {
				@HostEvent('@btn', 'click')
				onClick() {}
			}

			expect(() => {
				processDirective(parent, TestDirective);
			}).to.throw(Error, 'TestDirective.onClick: could not bind "click" event to element "@btn". Element does not exists.');
		});

		it('should throw an error when host event selector overflow directive boundary', () => {
			@Directive({
				selector: 'directive',
			})
			class TestDirective {
				@HostEvent('directive > button', 'click')
				onClick() {}
			}

			expect(() => {
				processDirective(parent, TestDirective);
			}).to.throw(Error, 'TestDirective.onClick: could not bind "click" event to element "directive > button". Element does not exists.');
		});

		it('should call host event on inner node', (done) => {
			@Directive({
				selector: 'directive',
			})
			class TestDirective {
				@HostEvent('div > button', 'click')
				onClick(e: Event, btn: ElementRef) {
					expect(e).to.be.an.instanceOf(Event);
					expect(btn).to.be.an.instanceOf(ElementRef);
					expect(btn.nativeElement).to.be.an.instanceOf(HTMLButtonElement);

					done();
				}
			}

			parent.innerHTML = '<div><button></button></div>';

			processDirective(parent, TestDirective);

			parent.querySelector('button').dispatchEvent(Dom.createMouseEvent('click'));
		});

		it('should call host event on all matching elements', () => {
			let called = [];

			@Directive({
				selector: 'directive',
			})
			class TestDirective {
				@HostEvent('button', 'click')
				onClick(e: Event, btn: ElementRef) {
					expect(e).to.be.an.instanceOf(Event);
					expect(btn).to.be.an.instanceOf(ElementRef);
					expect(btn.nativeElement).to.be.an.instanceOf(HTMLButtonElement);

					called.push(btn.nativeElement.innerText);
				}
			}

			parent.innerHTML = '<directive><button>1</button><button>2</button></directive>';

			processDirective(parent, TestDirective);

			parent.querySelector('button:first-of-type').dispatchEvent(Dom.createMouseEvent('click'));
			parent.querySelector('button:last-of-type').dispatchEvent(Dom.createMouseEvent('click'));

			expect(called).to.be.eql(['1', '2']);
		});

		it('should call host event on registered inner node', (done) => {
			@Directive({
				selector: 'directive',
			})
			class TestDirective {
				@HostElement('div > button') btn;
				@HostEvent('@btn', 'click')
				onClick(e: Event, btn: ElementRef) {
					expect(e).to.be.an.instanceOf(Event);
					expect(btn).to.be.equal(this.btn);
					expect(btn).to.be.an.instanceOf(ElementRef);
					expect(btn.nativeElement).to.be.an.instanceOf(HTMLButtonElement);

					done();
				}
			}

			parent.innerHTML = '<div><button></button></div>';

			processDirective(parent, TestDirective);

			parent.querySelector('button').dispatchEvent(Dom.createMouseEvent('click'));
		});

	});

});
