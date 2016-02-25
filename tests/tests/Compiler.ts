import {Compiler} from '../../src/Compiler';
import {Container} from '../../di';
import {Application, Component, Input, Event, Element, Required} from '../../core';


import chai = require('chai');
import {Dom} from "../../src/Util/Dom";


let expect = chai.expect;

let application: Application = null;
let compiler: Compiler = null;


let createClickEvent = (): MouseEvent => {
	let event = document.createEvent('MouseEvent');
	event.initMouseEvent('click', true, true, window, null, 0, 0, 0, 0, false, false, false, false, 0, null);

	return event;
};


describe('#Compiler', () => {

	beforeEach(() => {
		let container = new Container;
		application = new Application(container);
		compiler = container.get(Compiler);
	});

	describe('compile()', () => {

		it('should compile element', () => {
			@Component({selector: '[test]'})
			class Test {}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('test', 'test');

			compiler.compile(el);

			expect(el['__controllers']).to.be.an('array');
			expect(el['__controllers']).to.have.length(1);
			expect(el['__controllers'][0]).to.be.an.instanceOf(Test);
		});

		it('should compile element with more controllers', () => {
			@Component({selector: '[test1]'})
			class Test1 {}

			@Component({selector: '[test2]'})
			class Test2 {}

			application.registerController(Test1);
			application.registerController(Test2);

			let el = document.createElement('div');
			el.setAttribute('test1', 'test1');
			el.setAttribute('test2', 'test2');

			compiler.compile(el);

			expect(el['__controllers']).to.be.an('array');
			expect(el['__controllers']).to.have.length(2);
			expect(el['__controllers'][0]).to.be.an.instanceOf(Test1);
			expect(el['__controllers'][1]).to.be.an.instanceOf(Test2);
		});

		it('should call onInit method on controller', () => {
			let called = false;

			@Component({selector: '[test]'})
			class Test {
				onInit() {
					called = true;
				}
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('test', 'test');

			compiler.compile(el);

			expect(called).to.be.equal(true);
		});

		it('should set template', () => {
			@Component({selector: '[test]', template: 'lorem ipsum'})
			class Test {}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('test', 'test');

			compiler.compile(el);

			expect(el.innerHTML).to.be.equal('lorem ipsum');
		});

		it('should load input', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				public input1: string;
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('test', 'test');
			el.setAttribute('input1', 'hello');

			compiler.compile(el);

			expect(el['__controllers']).to.be.an('array');
			expect(el['__controllers']).to.have.length(1);

			let test = <Test>el['__controllers'][0];

			expect(test.input1).to.be.equal('hello');
		});

		it('should load input with different name', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input('data-input1')
				public input1: string;
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('test', 'test');
			el.setAttribute('data-input1', 'hello');

			compiler.compile(el);

			expect(el['__controllers']).to.be.an('array');
			expect(el['__controllers']).to.have.length(1);

			let test = <Test>el['__controllers'][0];

			expect(test.input1).to.be.equal('hello');
		});

		it('should not load input', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				public input1: string;
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('test', 'test');

			compiler.compile(el);

			expect(el['__controllers']).to.be.an('array');
			expect(el['__controllers']).to.have.length(1);

			let test = <Test>el['__controllers'][0];

			expect(test.input1).to.be.equal(null);
		});

		it('should not load input and use default value', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				public input1: string = 'bye';
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('test', 'test');

			compiler.compile(el);

			expect(el['__controllers']).to.be.an('array');
			expect(el['__controllers']).to.have.length(1);

			let test = <Test>el['__controllers'][0];

			expect(test.input1).to.be.equal('bye');
		});

		it('should load input as number', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				public input1: number;
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('test', 'test');
			el.setAttribute('input1', '54');

			compiler.compile(el);

			expect(el['__controllers']).to.be.an('array');
			expect(el['__controllers']).to.have.length(1);

			let test = <Test>el['__controllers'][0];

			expect(test.input1).to.be.equal(54);
		});

		it('should load input as boolean', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				public input1: boolean = true;
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('test', 'test');
			el.setAttribute('input1', 'false');

			compiler.compile(el);

			expect(el['__controllers']).to.be.an('array');
			expect(el['__controllers']).to.have.length(1);

			let test = <Test>el['__controllers'][0];

			expect(test.input1).to.be.equal(false);
		});

		it('should load inputs from element property', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input('[testProperty]')
				public input: Array<number>;
			}

			application.registerController(Test);

			let data = [1, 2, 3];

			let el = document.createElement('div');
			el.setAttribute('test', 'test');
			el['testProperty'] = data;

			compiler.compile(el);

			expect(el['__controllers']).to.be.an('array');
			expect(el['__controllers']).to.have.length(1);

			let test = <Test>el['__controllers'][0];

			expect(test.input).to.be.equal(data);
		});

		it('should not load inputs from element property but use default value', () => {
			let data = [4, 5, 6];

			@Component({selector: '[test]'})
			class Test {
				@Input('[testProperty]')
				public input: Array<number> = data;
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('test', 'test');

			compiler.compile(el);

			expect(el['__controllers']).to.be.an('array');
			expect(el['__controllers']).to.have.length(1);

			let test = <Test>el['__controllers'][0];

			expect(test.input).to.be.equal(data);
		});

		it('should load required input', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				@Required()
				public input;
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('test', 'test');
			el.setAttribute('input', 'hello');

			compiler.compile(el);

			expect(el['__controllers']).to.be.an('array');
			expect(el['__controllers']).to.have.length(1);

			let test = <Test>el['__controllers'][0];

			expect(test.input).to.be.equal('hello');
		});

		it('should load required property input', () => {
			@Component({selector: '[test]'})
			class Test {
				@Required()
				@Input('[testProperty]')
				public input;
			}

			application.registerController(Test);

			let data = [1, 2, 3];

			let el = document.createElement('div');
			el.setAttribute('test', 'test');
			el['testProperty'] = data;

			compiler.compile(el);

			expect(el['__controllers']).to.be.an('array');
			expect(el['__controllers']).to.have.length(1);

			let test = <Test>el['__controllers'][0];

			expect(test.input).to.be.equal(data);
		});

		it('should throw an error for required input', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				@Required()
				public input;
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('test', 'test');

			expect(() => {
				compiler.compile(el);
			}).to.throw(Error, "Component's input Test::input was not found in element.");
		});

		it('should load itself as an element', () => {
			@Component({selector: '[test]'})
			class Test {
				@Element()
				public el;
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('test', 'test');

			compiler.compile(el);

			expect(el['__controllers']).to.be.an('array');
			expect(el['__controllers']).to.have.length(1);

			let test = <Test>el['__controllers'][0];

			expect(test.el).to.be.equal(el);
		});

		it('should load child element', () => {
			@Component({selector: '[test]'})
			class Test {
				@Element('span')
				public child;
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('test', 'test');
			el.innerHTML = '<span>hello</span>';

			compiler.compile(el);

			expect(el['__controllers']).to.be.an('array');
			expect(el['__controllers']).to.have.length(1);

			let test = <Test>el['__controllers'][0];

			expect(test.child.nodeName.toLowerCase()).to.be.equal('span');
			expect(test.child.innerHTML).to.be.equal('hello');
		});

		it('should call event on main element', (done) => {
			let called = false;

			@Component({selector: '[test]'})
			class Test {
				@Event('click')
				public onClick() {
					called = true;
				}
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('test', 'test');

			compiler.compile(el);

			el.dispatchEvent(createClickEvent());

			expect(called).to.be.equal(true);

			done();
		});

		it('should call event on child element', (done) => {
			let called = false;

			@Component({selector: '[test]'})
			class Test {
				@Event('a', 'click')
				public onClick() {
					called = true;
				}
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('test', 'test');

			let link = document.createElement('a');
			el.appendChild(link);

			compiler.compile(el);

			link.dispatchEvent(createClickEvent());

			expect(called).to.be.equal(true);

			done();
		});

		it('should call event on attached child element', (done) => {
			let called = false;

			@Component({selector: '[test]'})
			class Test {
				@Element('a')
				public btn;

				@Event('@btn', 'click')
				public onClick() {
					called = true;
				}
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('test', 'test');

			let link = document.createElement('a');
			el.appendChild(link);

			compiler.compile(el);

			link.dispatchEvent(createClickEvent());

			expect(called).to.be.equal(true);

			done();
		});

	});

});
