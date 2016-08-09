import {Application, Compiler, ComponentView, ElementRef, Component, OnInit, OnDestroy} from '../../../core';
import {ForDirective} from '../../../common';
import {Container} from '../../../di';
import {Dom} from '../../../utils';
import {MockApplicationView} from '../../mocks/MockApplicationView';

import chai = require('chai');


let expect = chai.expect;

let container: Container = null;
let application: Application = null;
let compiler: Compiler = null;


describe('#Directives/ForDirective', () => {

	beforeEach(() => {
		container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	describe('bind()', () => {

		it('should iterate through simple array list', (done) => {
			let el = Dom.el('<ul><template [s:for]="#user in users"><li>- {{ user }} -</li></template></ul>');
			let view = new ComponentView(new MockApplicationView(container), ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.parameters['users'] = ['David', 'John', 'Clare'];

			compiler.compileElement(view, el);

			setTimeout(() => {
				expect(el.outerText).to.be.equal('- David -- John -- Clare -');
				done();
			}, 100);
		});

		it('should iterate through simple array list with key', (done) => {
			let el = Dom.el('<ul><template [s:for]="#i, #user in users"><li>- {{ i + ": " + user }} -</li></template></ul>');
			let view = new ComponentView(new MockApplicationView(container), ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.parameters['users'] = ['David', 'John', 'Clare'];

			compiler.compileElement(view, el);

			setTimeout(() => {
				expect(el.outerText).to.be.equal('- 0: David -- 1: John -- 2: Clare -');
				done();
			}, 100);
		});

		it('should iterate through simple object', (done) => {
			let el = Dom.el('<ul><template [s:for]="#value of options"><li>- {{ value }} -</li></template></ul>');
			let view = new ComponentView(new MockApplicationView(container), ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.parameters['options'] = {
				one: 'foo',
				two: 'bar',
				three: 'baz',
			};

			compiler.compileElement(view, el);

			setTimeout(() => {
				expect(el.outerText).to.be.equal('- foo -- bar -- baz -');
				done();
			}, 100);
		});

		it('should iterate through simple object with keys', (done) => {
			let el = Dom.el('<ul><template [s:for]="#key, #value of options"><li>- {{ key + ": " + value }} -</li></template></ul>');
			let view = new ComponentView(new MockApplicationView(container), ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.parameters['options'] = {
				one: 'foo',
				two: 'bar',
				three: 'baz',
			};

			compiler.compileElement(view, el);

			setTimeout(() => {
				expect(el.outerText).to.be.equal('- one: foo -- two: bar -- three: baz -');
				done();
			}, 100);
		});

		it('should update view when whole array is changed', () => {
			let el = Dom.el('<ul><template [s:for]="#user in users"><li>- {{ user }} -</li></template></ul>');
			let view = new ComponentView(new MockApplicationView(container), ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.parameters['users'] = ['David', 'John', 'Clare'];

			compiler.compileElement(view, el);

			expect(el.outerText).to.be.equal('- David -- John -- Clare -');

			view.parameters['users'] = ['David', 'John', 'Clare', 'Luke'];
			view.changeDetectorRef.refresh();

			expect(el.outerText).to.be.equal('- David -- John -- Clare -- Luke -');
		});

		it('should update view when new item is added to array', () => {
			let el = Dom.el('<ul><template [s:for]="#user in users"><li>- {{ user }} -</li></template></ul>');
			let view = new ComponentView(new MockApplicationView(container), ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.parameters['users'] = ['David', 'John', 'Clare'];

			compiler.compileElement(view, el);

			expect(el.outerText).to.be.equal('- David -- John -- Clare -');

			view.parameters['users'].push('Luke');
			view.changeDetectorRef.refresh();

			expect(el.outerText).to.be.equal('- David -- John -- Clare -- Luke -');
		});

		it('should update view when item is remove from an array', () => {
			let parent = Dom.el('<ul><template [s:for]="#user in users"><li>- {{ user }} -</li></template></ul>');
			let view = new ComponentView(new MockApplicationView(container), ElementRef.getByNode(parent));

			view.directives.push(ForDirective);
			view.parameters['users'] = ['David', 'John', 'Clare'];

			compiler.compileElement(view, parent);

			expect(parent.outerText).to.be.equal('- David -- John -- Clare -');

			view.parameters['users'].splice(-1, 1);
			view.changeDetectorRef.refresh();

			expect(parent.outerText).to.be.equal('- David -- John -');
		});

		it('should update view when new item is added to an object', () => {
			let el = Dom.el('<ul><template [s:for]="#key, #value of options"><li>- {{ key + ": " + value }} -</li></template></ul>');
			let view = new ComponentView(new MockApplicationView(container), ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.parameters['options'] = {
				a: 1,
				b: 2,
				c: 3,
			};

			compiler.compileElement(view, el);

			expect(el.outerText).to.be.equal('- a: 1 -- b: 2 -- c: 3 -');

			view.parameters['options'].d = 4;
			view.changeDetectorRef.refresh();

			expect(el.outerText).to.be.equal('- a: 1 -- b: 2 -- c: 3 -- d: 4 -');
		});

		it('should update view when item is removed from an object', () => {
			let el = Dom.el('<ul><template [s:for]="#key, #value of options"><li>- {{ key + ": " + value }} -</li></template></ul>');
			let view = new ComponentView(new MockApplicationView(container), ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.parameters['options'] = {
				a: 1,
				b: 2,
				c: 3,
			};

			compiler.compileElement(view, el);

			expect(el.outerText).to.be.equal('- a: 1 -- b: 2 -- c: 3 -');

			delete view.parameters['options'].c;
			view.changeDetectorRef.refresh();

			expect(el.outerText).to.be.equal('- a: 1 -- b: 2 -');
		});

		it('should create new component, destroy it and create again', () => {
			let initCalled = 0;
			let destroyCalled = 0;

			@Component({
				selector: '[test]',
				controllerAs: 't',
			})
			class Test implements OnInit, OnDestroy {
				public s = 'exists';
				public num = 0;
				onInit() {
					initCalled++;
					this.num = initCalled;
				}
				onDestroy() {
					destroyCalled++;
				}
			}

			let el = Dom.el('<div><template [s:for]="a in b"><div test>- {{ t.s }} ({{ t.num }}) -</div></template></div>');
			let view = new ComponentView(new MockApplicationView(container), ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.directives.push(Test);
			view.parameters['b'] = [];

			compiler.compileElement(view, el);

			expect(initCalled).to.be.equal(0);
			expect(destroyCalled).to.be.equal(0);
			expect(el.innerText).to.be.equal('');

			view.parameters['b'].push(null);
			view.changeDetectorRef.refresh();

			expect(initCalled).to.be.equal(1);
			expect(destroyCalled).to.be.equal(0);
			expect(el.innerText).to.be.equal('- exists (1) -');

			view.parameters['b'].splice(0, 1);
			view.changeDetectorRef.refresh();

			expect(initCalled).to.be.equal(1);
			expect(destroyCalled).to.be.equal(1);
			expect(el.innerText).to.be.equal('');

			view.parameters['b'].push(null);
			view.parameters['b'].push(null);
			view.changeDetectorRef.refresh();

			expect(initCalled).to.be.equal(3);
			expect(destroyCalled).to.be.equal(1);
			expect(el.innerText).to.be.equal('- exists (2) -- exists (3) -');
		});

	});

});
