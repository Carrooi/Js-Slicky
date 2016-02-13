import {Compiler} from '../../src/Compiler';
import {Container} from '../../di';
import {Application, Component, Input, Event, Element} from '../../core';


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

		it('should throw an error if controller not exists', () => {
			let el = document.createElement('div');
			el.setAttribute('data-component', 'test');

			expect(() => {
				compiler.compile(el);
			}).to.throw(Error, 'Component test is not registered.');
		});

		it('should compile element', () => {
			@Component({name: 'test'})
			class Test {}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('data-component', 'test');

			compiler.compile(el);

			expect(el['__controller']).to.be.an.instanceOf(Test);
		});

		it('should call onInit method on controller', () => {
			let called = false;

			@Component({name: 'test'})
			class Test {
				onInit() {
					called = true;
				}
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('data-component', 'test');

			compiler.compile(el);

			expect(called).to.be.equal(true);
		});

		it('should set template', () => {
			@Component({name: 'test', template: 'lorem ipsum'})
			class Test {}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('data-component', 'test');

			compiler.compile(el);

			expect(el.innerHTML).to.be.equal('lorem ipsum');
		});

		it('should load input', () => {
			@Component({name: 'test'})
			class Test {
				@Input()
				public input1: string;
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('data-component', 'test');
			el.setAttribute('data-input1', 'hello');

			compiler.compile(el);

			let test = <Test>el['__controller'];

			expect(test.input1).to.be.equal('hello');
		});

		it('should not load input', () => {
			@Component({name: 'test'})
			class Test {
				@Input()
				public input1: string;
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('data-component', 'test');

			compiler.compile(el);

			let test = <Test>el['__controller'];

			expect(test.input1).to.be.equal(null);
		});

		it('should not load input and use default value', () => {
			@Component({name: 'test'})
			class Test {
				@Input()
				public input1: string = 'bye';
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('data-component', 'test');

			compiler.compile(el);

			let test = <Test>el['__controller'];

			expect(test.input1).to.be.equal('bye');
		});

		it('should load input as number', () => {
			@Component({name: 'test'})
			class Test {
				@Input()
				public input1: number;
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('data-component', 'test');
			el.setAttribute('data-input1', '54');

			compiler.compile(el);

			let test = <Test>el['__controller'];

			expect(test.input1).to.be.equal(54);
		});

		it('should load input as boolean', () => {
			@Component({name: 'test'})
			class Test {
				@Input()
				public input1: boolean = true;
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('data-component', 'test');
			el.setAttribute('data-input1', 'false');

			compiler.compile(el);

			let test = <Test>el['__controller'];

			expect(test.input1).to.be.equal(false);
		});

		it('should load itself as an element', () => {
			@Component({name: 'test'})
			class Test {
				@Element()
				public el;
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('data-component', 'test');

			compiler.compile(el);

			let test = <Test>el['__controller'];

			expect(test.el).to.be.equal(el);
		});

		it('should load child element', () => {
			@Component({name: 'test'})
			class Test {
				@Element('span')
				public child;
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('data-component', 'test');
			el.innerHTML = '<span>hello</span>';

			compiler.compile(el);

			let test = <Test>el['__controller'];

			expect(test.child.nodeName.toLowerCase()).to.be.equal('span');
			expect(test.child.innerHTML).to.be.equal('hello');
		});

		it('should call event on main element', (done) => {
			let called = false;

			@Component({name: 'test'})
			class Test {
				@Event('click')
				public onClick() {
					called = true;
				}
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('data-component', 'test');

			compiler.compile(el);

			el.dispatchEvent(createClickEvent());

			expect(called).to.be.equal(true);

			done();
		});

		it('should call event on child element', (done) => {
			let called = false;

			@Component({name: 'test'})
			class Test {
				@Event('a', 'click')
				public onClick() {
					called = true;
				}
			}

			application.registerController(Test);

			let el = document.createElement('div');
			el.setAttribute('data-component', 'test');

			let link = document.createElement('a');
			el.appendChild(link);

			compiler.compile(el);

			link.dispatchEvent(createClickEvent());

			expect(called).to.be.equal(true);

			done();
		});

		it('should call event on attached child element', (done) => {
			let called = false;

			@Component({name: 'test'})
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
			el.setAttribute('data-component', 'test');

			let link = document.createElement('a');
			el.appendChild(link);

			compiler.compile(el);

			link.dispatchEvent(createClickEvent());

			expect(called).to.be.equal(true);

			done();
		});

	});

});
