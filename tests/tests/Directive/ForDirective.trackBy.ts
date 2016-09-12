import {Application, Compiler, ComponentView, ElementRef, Component, OnInit, OnDestroy} from '../../../core';
import {ForDirective} from '../../../common';
import {Container} from '../../../di';
import {Dom} from '../../../utils';

import chai = require('chai');


let expect = chai.expect;

let container: Container = null;
let application: Application = null;
let compiler: Compiler = null;


describe('#Directives/ForDirective.trackBy', () => {

	beforeEach(() => {
		container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	describe('bind()', () => {

		it('should iterate through simple array list', () => {
			let el = Dom.el('<ul><template [s:for] #user [s:for-of]="users" [s:for-track-by]="trackBy"><li>- {{ user }} -</li></template></ul>');
			let view = new ComponentView(container, ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.parameters['trackBy'] = (i, name) => name;
			view.parameters['users'] = ['David', 'John', 'Clare'];

			compiler.compileElement(view, el);

			expect(el.outerText).to.be.equal('- David -- John -- Clare -');
		});

		it('should iterate through simple array list with key', () => {
			let el = Dom.el('<ul><template [s:for] #i="index" #user [s:for-of]="users" [s:for-track-by]="trackBy"><li>- {{ i + ": " + user }} -</li></template></ul>');
			let view = new ComponentView(container, ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.parameters['trackBy'] = (i, name) => name;
			view.parameters['users'] = ['David', 'John', 'Clare'];

			compiler.compileElement(view, el);

			expect(el.outerText).to.be.equal('- 0: David -- 1: John -- 2: Clare -');
		});

		it('should iterate through simple object', () => {
			let el = Dom.el('<ul><template [s:for] #value [s:for-of]="options" [s:for-track-by]="trackBy"><li>- {{ value }} -</li></template></ul>');
			let view = new ComponentView(container, ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.parameters['trackBy'] = (key, value) => value;
			view.parameters['options'] = {
				one: 'foo',
				two: 'bar',
				three: 'baz',
			};

			compiler.compileElement(view, el);

			expect(el.outerText).to.be.equal('- foo -- bar -- baz -');
		});

		it('should iterate through simple object with keys', () => {
			let el = Dom.el('<ul><template [s:for] #key="index" #value [s:for-of]="options" [s:for-track-by]="trackBy"><li>- {{ key + ": " + value }} -</li></template></ul>');
			let view = new ComponentView(container, ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.parameters['trackBy'] = (key, value) => value;
			view.parameters['options'] = {
				one: 'foo',
				two: 'bar',
				three: 'baz',
			};

			compiler.compileElement(view, el);

			expect(el.outerText).to.be.equal('- one: foo -- two: bar -- three: baz -');
		});

		it('should update view when whole array is changed', () => {
			let el = Dom.el('<ul><template [s:for] #user [s:for-of]="users" [s:for-track-by]="trackBy"><li>- {{ user }} -</li></template></ul>');
			let view = new ComponentView(container, ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.parameters['trackBy'] = (i, name) => name;
			view.parameters['users'] = ['David', 'John', 'Clare'];

			compiler.compileElement(view, el);

			expect(el.outerText).to.be.equal('- David -- John -- Clare -');

			view.parameters['users'] = ['David', 'John', 'Clare', 'Luke'];
			view.changeDetectorRef.refresh();

			expect(el.outerText).to.be.equal('- David -- John -- Clare -- Luke -');
		});

		it('should update view when new item is added to array', () => {
			let el = Dom.el('<ul><template [s:for] #user [s:for-of]="users" [s:for-track-by]="trackBy"><li>- {{ user }} -</li></template></ul>');
			let view = new ComponentView(container, ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.parameters['trackBy'] = (i, name) => name;
			view.parameters['users'] = ['David', 'John', 'Clare'];

			compiler.compileElement(view, el);

			expect(el.outerText).to.be.equal('- David -- John -- Clare -');

			view.parameters['users'].push('Luke');
			view.changeDetectorRef.refresh();

			expect(el.outerText).to.be.equal('- David -- John -- Clare -- Luke -');
		});

		it('should update view when item is removed from an array', () => {
			let parent = Dom.el('<ul><template [s:for] #user [s:for-of]="users" [s:for-track-by]="trackBy"><li>- {{ user }} -</li></template></ul>');
			let view = new ComponentView(container, ElementRef.getByNode(parent));

			view.directives.push(ForDirective);
			view.parameters['trackBy'] = (i, name) => name;
			view.parameters['users'] = ['David', 'John', 'Clare'];

			compiler.compileElement(view, parent);

			expect(parent.outerText).to.be.equal('- David -- John -- Clare -');

			view.parameters['users'].splice(-1, 1);
			view.changeDetectorRef.refresh();

			expect(parent.outerText).to.be.equal('- David -- John -');
		});

		it('should update view when item is removed from middle of an array', () => {
			let parent = Dom.el('<ul><template [s:for] #user #key="index" [s:for-of]="users" [s:for-track-by]="trackBy"><li>- {{ key + ": " + user }} -</li></template></ul>');
			let view = new ComponentView(container, ElementRef.getByNode(parent));

			view.directives.push(ForDirective);
			view.parameters['trackBy'] = (i, name) => name;
			view.parameters['users'] = ['David', 'John', 'Clare'];

			compiler.compileElement(view, parent);

			expect(parent.outerText).to.be.equal('- 0: David -- 1: John -- 2: Clare -');

			view.parameters['users'].splice(1, 1);
			view.changeDetectorRef.refresh();

			expect(parent.outerText).to.be.equal('- 0: David -- 1: Clare -');
		});

		it('should update view when new item is added to an object', () => {
			let el = Dom.el('<ul><template [s:for] #key="index" #value [s:for-of]="options" [s:for-track-by]="trackBy"><li>- {{ key + ": " + value }} -</li></template></ul>');
			let view = new ComponentView(container, ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.parameters['trackBy'] = (key, value) => value;
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
			let el = Dom.el('<ul><template [s:for] #key="index" #value [s:for-of]="options" [s:for-track-by]="trackBy"><li>- {{ key + ": " + value }} -</li></template></ul>');
			let view = new ComponentView(container, ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.parameters['trackBy'] = (key, value) => value;
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
				template: '- {{ t.s }} ({{ t.num }}) -',
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

			let el = Dom.el('<div><template [s:for] #a [s:for-of]="b" [s:for-track-by]="trackBy"><div test></div></template></div>');
			let view = new ComponentView(container, ElementRef.getByNode(el));

			view.directives.push(ForDirective);
			view.directives.push(Test);
			view.parameters['trackBy'] = (i, letter) => letter;
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
