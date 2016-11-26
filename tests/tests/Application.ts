import {Application, Component, Directive, Filter, OnInit, ElementRef} from '../../core';
import {Container} from '../../di';
import {Dom} from '../../utils';

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
		
	});

});
