import {Dom} from '../../../../src/Util/Dom';
import {ElementRef} from '../../../../src/Templating/ElementRef';
import {OnInit, OnUpdate} from '../../../../src/Interfaces';
import {HostElement, Input, Required, HostEvent, Component} from '../../../../src/Entity/Metadata';

import {processComponent} from '../../_testHelpers';


import chai = require('chai');


let expect = chai.expect;
let parent: HTMLDivElement;


describe('#Templating/Compilers/RootCompiler.Component', () => {

	beforeEach(() => {
		parent = document.createElement('div');
	});

	describe('processDirective()', () => {

		it('should include simple component', () => {
			let called = false;

			@Component({
				selector: 'component',
				template: '',

			})
			class TestComponent implements OnInit {
				constructor(private el: ElementRef) {}
				onInit() {
					expect(this.el).to.be.an.instanceOf(ElementRef);
					console.log(this.el);

					called = true;
				}
			}

			processComponent(parent, TestComponent);

			expect(called).to.be.equal(true);
		});

		it('should throw an error when host element does not exists', () => {
			@Component({
				selector: 'component',
				template: '',
			})
			class TestComponent {
				@HostElement('button') btn;
			}

			expect(() => {
				processComponent(parent, TestComponent);
			}).to.throw(Error, 'TestComponent.btn: could not import host element "button". Element does not exists.');
		});

		it('should throw an error when host element overflow component boundary', () => {
			@Component({
				selector: 'component',
				template: '',
			})
			class TestComponent {
				@HostElement('component > button') btn;
			}

			expect(() => {
				processComponent(parent, TestComponent);
			}).to.throw(Error, 'TestComponent.btn: could not import host element "component > button". Element does not exists.');
		});

		it('should include host elements', () => {
			let called = false;

			@Component({
				selector: 'component',
				template: '<button>Click</button><div><span>hello</span></div>',
			})
			class TestComponent implements OnInit {
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

			processComponent(parent, TestComponent);

			expect(called).to.be.equal(true);
		});

		it('should import all inputs', () => {
			let called = false;
			let calledUpdate = 0;
			let scope = {
				prop: 'property',
				attr: 'attribute',
			};

			@Component({
				selector: 'component',
				template: '',
			})
			class TestComponent implements OnInit, OnUpdate {
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

			parent.innerHTML = '<component [property]="prop" attribute-custom="{{ attr }}" simple-attribute="simple"></component>';

			processComponent(<HTMLElement>parent.children[0], TestComponent, scope);

			expect(called).to.be.equal(true);
		});

		it('should throw an error when required input does not exists', () => {
			@Component({
				selector: 'directive',
				template: '',
			})
			class TestComponent {
				@Input() @Required() input;
			}

			expect(() => {
				processComponent(parent, TestComponent);
			}).to.throw(Error, 'TestComponent.input: could not find any suitable input in "div" element.');
		});

		it('should call host event on itself', (done) => {
			@Component({
				selector: 'button',
				template: '',
			})
			class TestComponent {
				constructor(private el: ElementRef) {}
				@HostEvent('click')
				onClick(e: Event, btn: ElementRef) {
					expect(e).to.be.an.instanceOf(Event);
					expect(btn).to.be.equal(this.el);

					done();
				}
			}

			parent.innerHTML = '<button></button>';

			processComponent(<HTMLElement>parent.children[0], TestComponent);

			parent.children[0].dispatchEvent(Dom.createMouseEvent('click'));
		});

		it('should throw an error when host event element does not exists', () => {
			@Component({
				selector: 'component',
				template: '',
			})
			class TestComponent {
				@HostEvent('button', 'click')
				onClick() {}
			}

			expect(() => {
				processComponent(parent, TestComponent);
			}).to.throw(Error, 'TestComponent.onClick: could not bind "click" event to element "button". Element does not exists.');
		});

		it('should throw an error when adding host event to not existing host element', () => {
			@Component({
				selector: 'component',
				template: '',
			})
			class TestComponent {
				@HostEvent('@btn', 'click')
				onClick() {}
			}

			expect(() => {
				processComponent(parent, TestComponent);
			}).to.throw(Error, 'TestComponent.onClick: could not bind "click" event to host element "btn". Host element does not exists.');
		});

		it('should throw an error when host event selector overflow directive boundary', () => {
			@Component({
				selector: 'component',
				template: '',
			})
			class TestComponent {
				@HostEvent('component > button', 'click')
				onClick() {}
			}

			expect(() => {
				processComponent(parent, TestComponent);
			}).to.throw(Error, 'TestComponent.onClick: could not bind "click" event to element "component > button". Element does not exists.');
		});

		it('should call host event on inner node', (done) => {
			@Component({
				selector: 'component',
				template: '<div><button></button></div>',
			})
			class TestComponent {
				@HostEvent('div > button', 'click')
				onClick(e: Event, btn: ElementRef) {
					expect(e).to.be.an.instanceOf(Event);
					expect(btn).to.be.an.instanceOf(ElementRef);
					expect(btn.nativeElement).to.be.an.instanceOf(HTMLButtonElement);

					done();
				}
			}

			processComponent(parent, TestComponent);

			parent.querySelector('button').dispatchEvent(Dom.createMouseEvent('click'));
		});

		it('should call host event on registered inner node', (done) => {
			@Component({
				selector: 'component',
				template: '<div><button></button></div>',
			})
			class TestComponent {
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

			processComponent(parent, TestComponent);

			parent.querySelector('button').dispatchEvent(Dom.createMouseEvent('click'));
		});

	});

});
