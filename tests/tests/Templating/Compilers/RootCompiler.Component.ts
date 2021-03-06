import {Dom} from '../../../../src/Util/Dom';
import {ElementRef} from '../../../../src/Templating/ElementRef';
import {OnInit} from '../../../../src/Interfaces';
import {HostElement, Input, Required, HostEvent, Component, ParentComponent} from '../../../../src/Entity/Metadata';

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
				constructor(private el: ElementRef<HTMLElement>) {}
				onInit() {
					expect(this.el).to.be.an.instanceOf(ElementRef);

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
				@HostElement() div: ElementRef<HTMLElement>;
				@HostElement('button') btn: ElementRef<HTMLElement>;
				@HostElement('div > span') title: ElementRef<HTMLElement>;
				constructor(private el: ElementRef<HTMLElement>) {}
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

			@Component({
				selector: 'component',
				template: '',
			})
			class TestComponent implements OnInit {
				@Input() property;
				@Input('attributeCustom') attribute;
				@Input() simpleAttribute;
				@Input() withDefault = 'default value';
				onInit() {
					called = true;

					expect(this.property).to.be.equal('prop');
					expect(this.attribute).to.be.equal('attr');
					expect(this.simpleAttribute).to.be.equal('simple');
					expect(this.withDefault).to.be.equal('default value');
				}
			}

			parent.innerHTML = '<component [property]="\'prop\'" attribute-custom="{{ \'attr\' }}" simple-attribute="simple"></component>';

			processComponent(<HTMLElement>parent.children[0], TestComponent);

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
				constructor(private el: ElementRef<HTMLElement>) {}
				@HostEvent('click')
				onClick(e: Event, btn: ElementRef<HTMLElement>) {
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
				onClick(e: Event, btn: ElementRef<HTMLElement>) {
					expect(e).to.be.an.instanceOf(Event);
					expect(btn).to.be.an.instanceOf(ElementRef);
					expect(btn.nativeElement).to.be.an.instanceOf(HTMLButtonElement);

					done();
				}
			}

			processComponent(parent, TestComponent);

			parent.querySelector('button').dispatchEvent(Dom.createMouseEvent('click'));
		});

		it('should call host event on all matching elements', () => {
			let called = [];

			@Component({
				selector: 'component',
				template: '<button>1</button><button>2</button>',
			})
			class TestComponent {
				@HostEvent('button', 'click')
				onClick(e: Event, btn: ElementRef<HTMLElement>) {
					expect(e).to.be.an.instanceOf(Event);
					expect(btn).to.be.an.instanceOf(ElementRef);
					expect(btn.nativeElement).to.be.an.instanceOf(HTMLButtonElement);

					called.push(btn.nativeElement.innerText);
				}
			}

			parent.innerHTML = '<component></component>';

			processComponent(parent, TestComponent);

			parent.querySelector('button:first-of-type').dispatchEvent(Dom.createMouseEvent('click'));
			parent.querySelector('button:last-of-type').dispatchEvent(Dom.createMouseEvent('click'));

			expect(called).to.be.eql(['1', '2']);
		});

		it('should call host event on registered inner node', (done) => {
			@Component({
				selector: 'component',
				template: '<div><button></button></div>',
			})
			class TestComponent {
				@HostElement('div > button') btn;
				@HostEvent('@btn', 'click')
				onClick(e: Event, btn: ElementRef<HTMLElement>) {
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

		it('should correctly parse multi line templates', () => {
			@Component({
				selector: 'component',
				template: `first
second
third`,
			})
			class TestComponent {}

			processComponent(parent, TestComponent);

			expect(parent.innerText).to.be.equal('first\nsecond\nthird');
		});

		it('should refresh template after timeout in onInit', (done) => {
			@Component({
				selector: 'component',
				controllerAs: 'c',
				template: '{{ c.count }}',
			})
			class TestComponent implements OnInit {
				count = 0;
				onInit() {
					setTimeout(() => {
						this.count++;
					}, 20);
				}
			}

			parent.innerHTML = '<component></component>';

			processComponent(parent, TestComponent);

			setTimeout(() => {
				expect(parent.innerText).to.be.equal('1');
				done();
			}, 50);
		});

		it('should preventDefault on template event', () => {
			@Component({
				selector: 'component',
				controllerAs: 'c',
				template: '<input type="checkbox" (click)!="c.doNothing()">'
			})
			class TestComponent {
				doNothing() {}
			}

			parent.innerHTML = '<component></component>';

			processComponent(parent, TestComponent);

			let checkbox = parent.querySelector('input');

			checkbox.dispatchEvent(Dom.createMouseEvent('click'));

			expect(checkbox.checked).to.be.equal(false);
		});

		it('should throw an error when having parent request', () => {
			@Component({
				selector: 'component',
				template: '',
			})
			class TestComponent {
				@ParentComponent() parent;
			}

			parent.innerHTML = '<component></component>';

			expect(() => {
				processComponent(parent, TestComponent);
			}).to.throw(Error, 'TestComponent.parent: can not use @ParentComponent() for root directives.');
		});

	});

});
