import {OnInit, OnUpdate, OnDestroy} from '../../../../src/Interfaces';
import {Directive, HostElement, Input, Required, HostEvent} from '../../../../src/Entity/Metadata';
import {ElementRef} from '../../../../src/Templating/ElementRef';
import {Dom} from '../../../../src/Util/Dom';
import {TemplateRef} from '../../../../src/Templating/TemplateRef';

import {createTemplate} from '../../_testHelpers';


import chai = require('chai');


let expect = chai.expect;
let parent: HTMLDivElement;


describe('#Templating/Compilers/ComponentCompiler.directives', () => {

	beforeEach(() => {
		parent = document.createElement('div');
	});

	describe('compile()', () => {

		it('should include simple directive', () => {
			let called = false;

			@Directive({
				selector: 'directive',
			})
			class TestDirective implements OnInit {
				constructor(private el: ElementRef) {}
				onInit() {
					expect(this.el).to.be.an.instanceOf(ElementRef);
					expect(this.el.nativeElement.outerHTML).to.be.equal('<directive></directive>');

					called = true;
				}
			}

			createTemplate(parent, '<directive></directive>', {}, [TestDirective]);

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
				createTemplate(parent, '<directive></directive>', {}, [TestDirective]);
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
				createTemplate(parent, '<directive><button></button></directive>', {}, [TestDirective]);
			}).to.throw(Error, 'TestDirective.btn: could not import host element "directive > button". Element does not exists.');
		});

		it('should include host elements', () => {
			let called = false;

			@Directive({
				selector: 'directive',
			})
			class TestDirective implements OnInit {
				@HostElement('button') btn: ElementRef;
				@HostElement('div > span') title: ElementRef;
				onInit() {
					called = true;

					expect(this.btn).to.be.an.instanceOf(ElementRef);
					expect(this.btn.nativeElement).to.be.an.instanceOf(HTMLButtonElement);
					expect(this.btn.nativeElement.innerText).to.be.equal('Click');

					expect(this.title).to.be.an.instanceOf(ElementRef);
					expect(this.title.nativeElement).to.be.an.instanceOf(HTMLSpanElement);
					expect(this.title.nativeElement.innerText).to.be.equal('hello');
				}
			}

			createTemplate(parent, '<directive><button>Click</button><div><span>hello</span></div></directive>', {}, [TestDirective]);

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

			let template = createTemplate(parent, '<directive [property]="prop" attribute-custom="{{ attr }}" simple-attribute="simple"></directive>', scope, [TestDirective]);

			expect(called).to.be.equal(true);

			scope.prop = 'property updated';
			scope.attr = 'attribute updated';

			template.changeDetector.check();

			expect(calledUpdate).to.be.equal(2);
		});

		it('should throw an error when required input does not exists', () => {
			@Directive({
				selector: 'directive',
			})
			class TestDirective {
				@Input() @Required() input;
			}

			expect(() => {
				createTemplate(parent, '<directive></directive>', {}, [TestDirective]);
			}).to.throw(Error, 'TestDirective.input: could not find any suitable input in "directive" element.');
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

			createTemplate(parent, '<button></button>', {}, [TestDirective]);

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
				createTemplate(parent, '<directive></directive>', {}, [TestDirective]);
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
				createTemplate(parent, '<directive></directive>', {}, [TestDirective]);
			}).to.throw(Error, 'TestDirective.onClick: could not bind "click" event to host element "btn". Host element does not exists.');
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
				createTemplate(parent, '<directive><button></button></directive>', {}, [TestDirective]);
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

			createTemplate(parent, '<directive><div><button></button></div></directive>', {}, [TestDirective]);

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

			createTemplate(parent, '<directive><button>1</button><button>2</button></directive>', {}, [TestDirective]);

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

			createTemplate(parent, '<directive><div><button></button></div></directive>', {}, [TestDirective]);

			parent.querySelector('button').dispatchEvent(Dom.createMouseEvent('click'));
		});

		it('should correctly detach directive', () => {
			let calledInit = false;
			let calledDestroy = false;

			@Directive({
				selector: 'directive',
			})
			class TestDirective implements OnInit, OnDestroy {
				onInit() {
					calledInit = true;
				}
				onDestroy() {
					calledDestroy = true;
				}
			}

			createTemplate(parent, '<template><directive></directive></template>', {}, [TestDirective]);

			let embeddedTemplate = TemplateRef.get(<HTMLElement>parent.childNodes[0]).createEmbeddedTemplate();

			expect(calledInit).to.be.equal(true);
			expect(calledDestroy).to.be.equal(false);

			embeddedTemplate.remove();

			expect(calledDestroy).to.be.equal(true);
		});

	});

});
