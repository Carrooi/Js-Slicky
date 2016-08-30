import {Application, Compiler, ApplicationView, ComponentView, Component, OnInit, Input, Required, ElementRef} from '../../../core';
import {Container} from '../../../di';
import {Dom} from '../../../utils';


import chai = require('chai');


let expect = chai.expect;

let container: Container = null;
let application: Application = null;
let compiler: Compiler = null;


describe('#Compiler/components/inputs', () => {

	beforeEach(() => {
		container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	describe('compile()', () => {

		it('should load component\'s input', (done) => {
			@Component({
				selector: '[test]',
				template: '',
			})
			class Test implements OnInit {
				@Input()
				public input1: string;

				onInit() {
					expect(this.input1).to.be.equal('hello');
					done();
				}
			}

			let el = Dom.el('<div><div test [input1]="\'hello\'"></div></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [Test]);

			compiler.compile(view);
		});

		it('should load component\'s input from ordinary attribute', (done) => {
			@Component({
				selector: '[test]',
				template: '',
			})
			class Test implements OnInit {
				@Input()
				public test: string;

				onInit() {
					expect(this.test).to.be.equal('hello');
					done();
				}
			}

			let el = Dom.el('<div><div test="hello"></div></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [Test]);

			compiler.compile(view);
		});

		it('should load component\'s input with different name', (done) => {
			@Component({
				selector: '[test]',
				template: '',
			})
			class Test implements OnInit {
				@Input('data-input1')
				public input1: string;

				onInit() {
					expect(this.input1).to.be.equal('hello');
					done();
				}
			}

			let el = Dom.el('<div><div test [data-input1]="\'hello\'"></div></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [Test]);

			compiler.compile(view);
		});

		it('should not load component\'s input', (done) => {
			@Component({
				selector: '[test]',
				template: '',
			})
			class Test implements OnInit {
				@Input()
				public input1: string;

				onInit() {
					expect(this.input1).to.be.equal(undefined);
					done();
				}
			}

			let el = Dom.el('<div><div test></div></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [Test]);

			compiler.compile(view);
		});

		it('should not load component\'s input but use default value', (done) => {
			@Component({
				selector: '[test]',
				template: '',
			})
			class Test implements OnInit {
				@Input()
				public input1: string = 'bye';

				onInit() {
					expect(this.input1).to.be.equal('bye');
					done();
				}
			}

			let el = Dom.el('<div><div test></div></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [Test]);

			compiler.compile(view);
		});

		it('should pass json into component input', (done) => {
			@Component({
				selector: 'app',
				template: '',
			})
			class App implements OnInit {
				@Input()
				data = null;

				onInit() {
					expect(this.data).to.be.eql({'a.b.c': 'hello'});
					done();
				}
			}

			let el = Dom.el('<div><app [data]=\'{"a.b.c": "hello"}\'></app></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [App], {a: 'test'});

			compiler.compile(view);
		});

		it('should throw an error when component\'s required input is missing', () => {
			@Component({
				selector: '[test]',
				template: '',
			})
			class Test {
				@Input()
				@Required()
				public input;
			}

			let el = Dom.el('<div><div test></div></div>');
			let view = new ApplicationView(container, ElementRef.getByNode(el), [Test]);

			expect(() => {
				compiler.compile(view);
			}).to.throw(Error, "Component's input Test::input was not found in div element.");
		});

		it('should set component input with upper cased name', (done) => {
			@Component({
				selector: '[test]',
				template: '',
			})
			class Test implements OnInit {
				@Input()
				upperCasedInput;

				onInit() {
					expect(this.upperCasedInput).to.be.equal('hello');
					done();
				}
			}

			let el = Dom.el('<div><div test [upperCasedInput]="a"></div></div>');
			var view = new ApplicationView(container, ElementRef.getByNode(el), [Test], {a: 'hello'});

			compiler.compile(view);
		});

		it('should update component\'s input', (done) => {
			@Component({
				selector: '[test]',
				template: '',
			})
			class Test implements OnInit {
				@Input()
				input;
				
				onInit() {
					expect(this.input).to.be.equal('hello');

					setTimeout(() => {
						expect(this.input).to.be.equal('bye');
						done();
					}, 100);
				}
			}

			let el = Dom.el('<div><div test [input]="a"></div></div>');
			var view = new ApplicationView(container, ElementRef.getByNode(el), [Test], {a: 'hello'});

			compiler.compile(view);

			let innerView = <ComponentView>view.children[0];

			innerView.parameters['a'] = 'bye';
			innerView.changeDetectorRef.refresh();
		});

	});

});
