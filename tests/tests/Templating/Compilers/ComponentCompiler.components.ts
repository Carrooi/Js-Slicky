import {Component, Input, Output, HostElement, Required, HostEvent, ParentComponent} from '../../../../src/Entity/Metadata';
import {OnInit, OnUpdate} from '../../../../src/Interfaces';
import {ChangeDetectionStrategy} from '../../../../src/constants';
import {ElementRef} from '../../../../src/Templating/ElementRef';
import {Filter} from '../../../../src/Templating/Filters/Metadata';
import {Dom} from '../../../../src/Util/Dom';
import {EventEmitter} from '../../../../src/Util/EventEmitter';
import {IfDirective} from '../../../../src/Directives/IfDirective';
import {ForDirective} from '../../../../src/Directives/ForDirective';
import {IterableDifferFactory} from '../../../../src/ChangeDetection/IterableDiffer';

import {createTemplate} from '../../_testHelpers';


import chai = require('chai');


let expect = chai.expect;
let parent: HTMLDivElement;


describe('#Templating/Compilers/ComponentCompiler.components', () => {

	beforeEach(() => {
		parent = document.createElement('div');
	});

	describe('compile()', () => {

		it('should include simple component', () => {
			let called = false;

			@Component({
				selector: 'component',
				template: 'hello world',
			})
			class TestComponent implements OnInit {
				constructor(private el: ElementRef<HTMLElement>) {}
				onInit() {
					expect(this.el).to.be.an.instanceOf(ElementRef);
					expect(this.el.nativeElement.outerHTML).to.be.equal('<component>hello world</component>');

					called = true;
				}
			}

			createTemplate(parent, '<component></component>', {}, [TestComponent]);

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
				createTemplate(parent, '<component></component>', {}, [TestComponent]);
			}).to.throw(Error, 'TestComponent.btn: could not import host element "button". Element does not exists.');
		});

		it('should throw an error when host element overflow component boundary', () => {
			@Component({
				selector: 'component',
				template: '<button></button>',
			})
			class TestComponent {
				@HostElement('component > button') btn;
			}

			expect(() => {
				createTemplate(parent, '<component></component>', {}, [TestComponent]);
			}).to.throw(Error, 'TestComponent.btn: could not import host element "component > button". Element does not exists.');
		});

		it('should include host elements', () => {
			let called = false;

			@Component({
				selector: 'component',
				template: '<button>Click</button><div><span>hello</span></div>',
			})
			class TestComponent implements OnInit {
				@HostElement('button') btn: ElementRef<HTMLElement>;
				@HostElement('div > span') title: ElementRef<HTMLElement>;
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

			createTemplate(parent, '<component></component>', {}, [TestComponent]);

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

			let template = createTemplate(parent, '<component [property]="prop" attribute-custom="{{ attr }}" simple-attribute="simple"></component>', scope, [TestComponent]);

			expect(called).to.be.equal(true);

			scope.prop = 'property updated';
			scope.attr = 'attribute updated';

			template.checkWatchers();

			expect(calledUpdate).to.be.equal(2);
		});

		it('should use filter inside of input', () => {
			let scope = {
				number: 1,
				append: 1,
			};

			@Component({
				selector: 'component',
				controllerAs: 'cmp',
				template: '{{ cmp.input }}',
			})
			class TestComponent {
				@Input() input;
			}

			@Filter({
				name: 'filter',
			})
			class TestFilter {
				transform(input: any) {
					return input + scope.append;
				}
			}

			let template = createTemplate(parent, '<component [input]="number | filter"></component>', scope, [TestComponent], [], [TestFilter]);

			expect(parent.innerText).to.be.equal('2');

			scope.append++;
			template.checkWatchers();

			expect(parent.innerText).to.be.equal('3');
		});

		it('should throw an error when required input does not exists', () => {
			@Component({
				selector: 'component',
				template: '',
			})
			class TestComponent {
				@Input() @Required() input;
			}

			expect(() => {
				createTemplate(parent, '<component></component>', {}, [TestComponent]);
			}).to.throw(Error, 'TestComponent.input: could not find any suitable input in "component" element.');
		});

		it('should call simple output', () => {
			let called = false;

			@Component({
				selector: 'component',
				controllerAs: 'c',
				template: '',
			})
			class TestComponent implements OnInit {
				@Output() call = new EventEmitter<string>();
				onInit() {
					this.call.emit('lorem ipsum');
				}
			}

			@Component({
				selector: 'parent',
				controllerAs: 'p',
				template: '<component (call)="p.called($this, $value)"></component>',
				directives: [TestComponent],
			})
			class TestParentComponent {
				called(child: TestComponent, value: string) {
					expect(child).to.be.an.instanceOf(TestComponent);
					expect(value).to.be.equal('lorem ipsum');
					called = true;
				}
			}

			createTemplate(parent, '<parent></parent>', {}, [TestParentComponent]);

			expect(called).to.be.equal(true);
		});

		it('should call output with custom name', () => {
			let called = false;

			@Component({
				selector: 'component',
				controllerAs: 'c',
				template: '',
			})
			class TestComponent implements OnInit {
				@Output('call') onCall = new EventEmitter<string>();
				onInit() {
					this.onCall.emit('lorem ipsum');
				}
			}

			@Component({
				selector: 'parent',
				controllerAs: 'p',
				template: '<component (call)="p.called($this, $value)"></component>',
				directives: [TestComponent],
			})
			class TestParentComponent {
				called(child: TestComponent, value: string) {
					expect(child).to.be.an.instanceOf(TestComponent);
					expect(value).to.be.equal('lorem ipsum');
					called = true;
				}
			}

			createTemplate(parent, '<parent></parent>', {}, [TestParentComponent]);

			expect(called).to.be.equal(true);
		});

		it('should call output from within embedded template', () => {
			let called = false;

			@Component({
				selector: 'component',
				controllerAs: 'c',
				template: '',
			})
			class TestComponent implements OnInit {
				@Output('call') onCall = new EventEmitter<string>();
				onInit() {
					this.onCall.emit('lorem ipsum');
				}
			}

			@Component({
				selector: 'parent',
				controllerAs: 'p',
				template:
					'<template>' +
						'<component (call)="p.called($this, $value)"></component>' +
					'</template>' +
					'<content selector="template"></content>'
				,
				directives: [TestComponent],
			})
			class TestParentComponent {
				called(child: TestComponent, value: string) {
					expect(child).to.be.an.instanceOf(TestComponent);
					expect(value).to.be.equal('lorem ipsum');
					called = true;
				}
			}

			createTemplate(parent, '<parent></parent>', {}, [TestParentComponent]);

			expect(called).to.be.equal(true);
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

			createTemplate(parent, '<button></button>', {}, [TestComponent]);

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
				createTemplate(parent, '<component></component>', {}, [TestComponent]);
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
				createTemplate(parent, '<component></component>', {}, [TestComponent]);
			}).to.throw(Error, 'TestComponent.onClick: could not bind "click" event to host element "btn". Host element does not exists.');
		});

		it('should throw an error when host event selector overflow component boundary', () => {
			@Component({
				selector: 'component',
				template: '<button></button>',
			})
			class TestComponent {
				@HostEvent('component > button', 'click')
				onClick() {}
			}

			expect(() => {
				createTemplate(parent, '<component></component>', {}, [TestComponent]);
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

			createTemplate(parent, '<component></component>', {}, [TestComponent]);

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

			createTemplate(parent, '<component></component>', {}, [TestComponent]);

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

			createTemplate(parent, '<component></component>', {}, [TestComponent]);

			parent.querySelector('button').dispatchEvent(Dom.createMouseEvent('click'));
		});

		it('should have access to parent component in template', () => {
			@Component({
				selector: 'child',
				template: '{{ p.type }}',
			})
			class TestComponentChild {}

			@Component({
				selector: 'parent',
				template: '<child></child>',
				controllerAs: 'p',
				directives: [TestComponentChild],
			})
			class TestComponentParent {
				type = 'parent';
			}

			createTemplate(parent, '<parent></parent>', {}, [TestComponentParent]);

			expect(parent.innerText).to.be.equal('parent');
		});

		it('should be able to use directives from any parent', () => {
			@Component({
				selector: 'component',
				template: 'test',
			})
			class TestComponent {}

			@Component({
				selector: 'child',
				template: '<component></component>',
			})
			class TestComponentChild {}

			@Component({
				selector: 'parent',
				template: '<child></child>',
				directives: [TestComponent, TestComponentChild],
			})
			class TestComponentParent {}

			createTemplate(parent, '<parent></parent>', {}, [TestComponentParent]);

			expect(parent.innerText).to.be.equal('test');
		});

		it('should not parse same directive more times in child component', () => {
			@Component({
				selector: 'child',
				template: '<template [s:if]="true">lorem ipsum</template>',
				directives: [IfDirective, IfDirective],
			})
			class TestChildComponent {}

			@Component({
				selector: 'parent',
				controllerAs: 'p',
				template: '<child></child>',
				directives: [IfDirective, TestChildComponent],
			})
			class TestParentComponent {}

			createTemplate(parent, '<parent></parent>', {}, [TestParentComponent]);

			expect(parent.innerText).to.be.equal('lorem ipsum');
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

			createTemplate(parent, '<component></component>', {}, [TestComponent]);

			setTimeout(() => {
				expect(parent.innerText).to.be.equal('1');
				done();
			}, 50);
		});

		it('should import inputs before compiling template', () => {
			@Component({
				selector: 'component',
				controllerAs: 'c',
				template: '{{ typeof c.input }}',
				changeDetection: ChangeDetectionStrategy.OnPush,
			})
			class TestComponent {
				@Required() @Input() input;
			}

			createTemplate(parent, '<component input="lorem ipsum"></component>', {}, [TestComponent]);

			expect(parent.innerText).to.be.equal('string');
		});

		it('should import input from ForDirective', () => {
			@Component({
				selector: 'component',
				controllerAs: 'cmp',
				template: '{{ cmp.data }}',
			})
			class TestComponent {
				@Input() data;
			}

			createTemplate(parent, '<component *s:for="#item of items" [data]="item"></component>', {items: [1]}, [ForDirective, TestComponent], [IterableDifferFactory]);

			expect(parent.innerText).to.be.equal('1');
		});

		it('exported component should overwrite local parameter', () => {
			@Component({
				selector: 'component',
				controllerAs: 'c',
				template: '{{ c.item }}',
			})
			class TestComponent {
				@Input() item;
			}

			createTemplate(parent, '<component *s:for="#c of items" [item]="c"></component>', {items: [1]}, [ForDirective, TestComponent], [IterableDifferFactory]);

			expect(parent.innerText).to.be.equal('1');
		});

		it('should use filters in ForDirective', () => {
			@Component({
				selector: 'component',
				controllerAs: 'cmp',
				template: '- {{ cmp.input }} -',
			})
			class TestComponent {
				@Input() input;
			}

			@Filter({
				name: 'filter',
			})
			class TestFilter {
				transform(items, pattern) {
					return items.filter((item) => pattern.test(item));
				}
			}

			let scope = {
				items: ['abc', 'bcd', 'cde', 'acd', 'hid', 'aoj', 'bjd'],
				pattern: /^a/,
			};

			let template = createTemplate(parent, '<component *s:for="#item of items | filter : pattern" [input]="item"></component>', scope, [TestComponent, ForDirective], [IterableDifferFactory], [TestFilter]);

			expect(parent.innerText).to.be.equal('- abc -- acd -- aoj -');

			scope.pattern = /^b/;
			template.checkWatchers();

			expect(parent.innerText).to.be.equal('- bcd -- bjd -');
		});

		it('should add two way data binding', () => {
			@Component({
				selector: 'child',
				template: '',
			})
			class TestChildComponent {
				@Input() data;
				@Output() dataChange = new EventEmitter<number>();
				onInit() {
					this.data++;
					this.dataChange.emit(this.data);
				}
			}

			@Component({
				selector: 'parent',
				controllerAs: 'parent',
				template: '<child [(data)]="parent.childData"></child>{{ parent.childData }}',
				directives: [TestChildComponent],
			})
			class TestParentComponent {
				childData = 0;
			}

			createTemplate(parent, '<parent></parent>', {}, [TestParentComponent]);

			expect(parent.innerText).to.be.equal('1');
		});

		it('should include any parent component into child component', () => {
			let called = false;

			@Component({
				selector: 'child',
				template: '',
			})
			class TestChildComponent implements OnInit {
				@ParentComponent() parent;
				onInit() {
					expect(this.parent).to.be.an.instanceOf(TestParentComponent);
					called = true;
				}
			}

			@Component({
				selector: 'parent',
				template: '<child></child>',
				directives: [TestChildComponent],
			})
			class TestParentComponent {}

			createTemplate(parent, '<parent></parent>', {}, [TestParentComponent]);

			expect(called).to.be.equal(true);
		});

		it('should throw an error when requested parent does not match actual parent', () => {
			@Component({
				selector: 'valid-parent',
				template: '',
			})
			class TestValidParentComponent {}

			@Component({
				selector: 'child',
				template: '',
			})
			class TestChildComponent {
				@ParentComponent(TestValidParentComponent) parent;
			}

			@Component({
				selector: 'invalid-parent',
				template: '<child></child>',
				directives: [TestChildComponent],
			})
			class TestInvalidParentComponent {}

			expect(() => {
				createTemplate(parent, '<invalid-parent></invalid-parent>', {}, [TestInvalidParentComponent]);
			}).to.throw(Error, 'TestChildComponent.parent: expected parent to be an instance of "TestValidParentComponent", but directive is used inside of "TestInvalidParentComponent" component.');
		});

	});

});
