import {Application, Component, Directive, Filter, OnInit, ElementRef} from '../../core';
import {Container, Injectable} from '../../di';
import {CompilerFactory} from '../../src/Templating/Compilers/CompilerFactory';
import {DirectiveParser} from '../../src/Entity/DirectiveParser';

import chai = require('chai');


let expect = chai.expect;
let parent: HTMLDivElement;
let application: Application = null;


describe('#Application', () => {

	beforeEach(() => {
		parent = document.createElement('div');
		let container = new Container;
		application = new Application(container);
	});
	
	describe('run()', () => {
		
		it('should compile application with one root component', () => {
			@Component({
				selector: 'component',
				template: 'Hello world',
			})
			class TestComponent {}

			parent.innerHTML = '<component></component>';
			
			application.run(TestComponent, {
				parentElement: parent,
			});

			expect(parent.innerHTML).to.be.equal('<component>Hello world</component>');
		});

		it('should compile application with one root directive', () => {
			@Directive({
				selector: 'directive',
			})
			class TestDirective implements OnInit {
				constructor(private el: ElementRef) {}
				onInit() {
					(<HTMLElement>this.el.nativeElement).innerText = 'Hello world';
				}
			}

			parent.innerHTML = '<directive></directive>';

			application.run(TestDirective, {
				parentElement: parent,
			});

			expect(parent.innerHTML).to.be.equal('<directive>Hello world</directive>');
		});

		it('should compile application with directives and components', () => {
			@Component({
				selector: 'component',
				template: 'Hello world',
			})
			class TestComponent {}

			@Directive({
				selector: 'directive',
			})
			class TestDirective implements OnInit {
				constructor(private el: ElementRef) {}
				onInit() {
					this.el.nativeElement.innerText = 'Hello world';
				}
			}

			parent.innerHTML = '<component></component><directive></directive>';

			application.run([TestComponent, TestDirective], {
				parentElement: parent,
			});

			expect(parent.innerHTML).to.be.equal('<component>Hello world</component><directive>Hello world</directive>');
		});

		it('should register custom filters for all root directives', () => {
			@Filter({
				name: 'plus',
			})
			class TestFilter {
				transform(num) {
					return num + 1;
				}
			}

			@Component({
				selector: 'component',
				controllerAs: 'cmp',
				template: '{{ cmp.number | plus }}',
			})
			class TestComponent {
				number = 4;
			}

			parent.innerHTML = '<component></component>';

			application.run([TestComponent], {
				parentElement: parent,
				filters: [TestFilter],
			});

			expect(parent.innerHTML).to.be.equal('<component>5</component>');
		});

		it('should add dynamically new root component', () => {
			@Component({
				controllerAs: 'inner',
				template: '{{ inner.count }}',
			})
			class TestDynamicComponent {
				static counter = 0;
				count = TestDynamicComponent.counter++;
			}

			@Component({
				selector: 'component',
				template: 'components:',
			})
			class TestComponent implements OnInit {
				constructor(private compilerFactory: CompilerFactory) {}
				onInit() {
					let definition = DirectiveParser.parse(TestDynamicComponent);
					let compiler = this.compilerFactory.createRootCompiler(TestDynamicComponent, definition);

					compiler.processComponent(<HTMLDivElement>parent.querySelector('#first'));
					compiler.processComponent(<HTMLDivElement>parent.querySelector('#second'));
				}
			}

			parent.innerHTML = '<component></component> <div id="first"></div>, <div id="second"></div>';

			application.run([TestComponent], {
				parentElement: parent,
			});

			expect(parent.innerText).to.be.equal('components: 0, 1');
		});

		it('should pass additional services into dynamic root component', () => {
			let called = false;

			@Injectable()
			class TestService {}

			@Component({
				template: '',
			})
			class TestDynamicComponent implements OnInit {
				constructor(private service: TestService) {}
				onInit() {
					expect(this.service).to.be.an.instanceOf(TestService);
					called = true;
				}
			}

			@Component({
				selector: 'component',
				template: '',
			})
			class TestComponent implements OnInit {
				constructor(private compilerFactory: CompilerFactory) {}
				onInit() {
					let definition = DirectiveParser.parse(TestDynamicComponent);
					let compiler = this.compilerFactory.createRootCompiler(TestDynamicComponent, definition);

					compiler.processComponent(parent.querySelector('div'), {}, [{
						service: TestService,
						options: {
							useFactory: () => new TestService,
						},
					}]);
				}
			}

			parent.innerHTML = '<component></component><div></div>';

			application.run([TestComponent], {
				parentElement: parent,
			});

			expect(called).to.be.equal(true);
		});
		
	});

});
