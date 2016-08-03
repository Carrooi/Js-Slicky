import {View} from '../../../src/Views/View';
import {OnInit, OnDestroy} from '../../../src/Interfaces';
import {ForDirective} from '../../../src/Directives/ForDirective';
import {Application} from '../../../src/Application';
import {Compiler} from '../../../src/Compiler';
import {Container} from '../../../src/DI/Container';
import {ElementRef} from '../../../src/Templating/ElementRef';
import {Component} from '../../../src/Entity/Metadata';

import chai = require('chai');


let expect = chai.expect;

let application: Application = null;
let compiler: Compiler = null;


describe('#Directives/ForDirective', () => {

	beforeEach(() => {
		let container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	describe('bind()', () => {

		it('should iterate through simple array list', (done) => {
			let parent = document.createElement('ul');
			parent.innerHTML = '<template [s:for]="#user in users"><li>- {{ user }} -</li></template>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.directives.push(ForDirective);
			view.parameters['users'] = ['David', 'John', 'Clare'];

			compiler.compileElement(view, parent);

			setTimeout(() => {
				expect(parent.outerText).to.be.equal('- David -- John -- Clare -');
				done();
			}, 100);
		});

		it('should iterate through simple array list with key', (done) => {
			let parent = document.createElement('ul');
			parent.innerHTML = '<template [s:for]="#i, #user in users"><li>- {{ i + ": " + user }} -</li></template>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.directives.push(ForDirective);
			view.parameters['users'] = ['David', 'John', 'Clare'];

			compiler.compileElement(view, parent);

			setTimeout(() => {
				expect(parent.outerText).to.be.equal('- 0: David -- 1: John -- 2: Clare -');
				done();
			}, 100);
		});

		it('should iterate through simple object', (done) => {
			let parent = document.createElement('ul');
			parent.innerHTML = '<template [s:for]="#value of options"><li>- {{ value }} -</li></template>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.directives.push(ForDirective);
			view.parameters['options'] = {
				one: 'foo',
				two: 'bar',
				three: 'baz',
			};

			compiler.compileElement(view, parent);

			setTimeout(() => {
				expect(parent.outerText).to.be.equal('- foo -- bar -- baz -');
				done();
			}, 100);
		});

		it('should iterate through simple object with keys', (done) => {
			let parent = document.createElement('ul');
			parent.innerHTML = '<template [s:for]="#key, #value of options"><li>- {{ key + ": " + value }} -</li></template>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.directives.push(ForDirective);
			view.parameters['options'] = {
				one: 'foo',
				two: 'bar',
				three: 'baz',
			};

			compiler.compileElement(view, parent);

			setTimeout(() => {
				expect(parent.outerText).to.be.equal('- one: foo -- two: bar -- three: baz -');
				done();
			}, 100);
		});

		it('should update view when whole array is changed', (done) => {
			let parent = document.createElement('ul');
			parent.innerHTML = '<template [s:for]="#user in users"><li>- {{ user }} -</li></template>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.directives.push(ForDirective);
			view.parameters['users'] = ['David', 'John', 'Clare'];

			compiler.compileElement(view, parent);
			view.watcher.run();

			setTimeout(() => {
				expect(parent.outerText).to.be.equal('- David -- John -- Clare -');
				view.parameters['users'] = ['David', 'John', 'Clare', 'Luke'];

				done();

				/*setTimeout(() => {
					expect(parent.outerText).to.be.equal('- David -- John -- Clare -- Luke -');
					done();
				}, 100);*/
			}, 100);
		});

		it('should update view when new item is added to array', (done) => {
			let parent = document.createElement('ul');
			parent.innerHTML = '<template [s:for]="#user in users"><li>- {{ user }} -</li></template>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.directives.push(ForDirective);
			view.parameters['users'] = ['David', 'John', 'Clare'];

			compiler.compileElement(view, parent);
			view.watcher.run();

			let innerView = view.children[0];

			setTimeout(() => {
				expect(parent.outerText).to.be.equal('- David -- John -- Clare -');

				innerView.parameters['users'].push('Luke');

				setTimeout(() => {
					expect(parent.outerText).to.be.equal('- David -- John -- Clare -- Luke -');
					done();
				}, 100);
			}, 100);
		});

		it('should update view when item is remove from an array', (done) => {
			let parent = document.createElement('ul');
			parent.innerHTML = '<template [s:for]="#user in users"><li>- {{ user }} -</li></template>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.directives.push(ForDirective);
			view.parameters['users'] = ['David', 'John', 'Clare'];

			compiler.compileElement(view, parent);
			view.watcher.run();

			let innerView = view.children[0];

			setTimeout(() => {
				expect(parent.outerText).to.be.equal('- David -- John -- Clare -');

				innerView.parameters['users'].splice(-1, 1);

				setTimeout(() => {
					expect(parent.outerText).to.be.equal('- David -- John -');
					done();
				}, 100);
			}, 100);
		});

		it('should update view when new item is added to an object', (done) => {
			let parent = document.createElement('ul');
			parent.innerHTML = '<template [s:for]="#key, #value of options"><li>- {{ key + ": " + value }} -</li></template>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.directives.push(ForDirective);
			view.parameters['options'] = {
				a: 1,
				b: 2,
				c: 3,
			};

			compiler.compileElement(view, parent);
			view.watcher.run();

			let innerView = view.children[0];

			setTimeout(() => {
				expect(parent.outerText).to.be.equal('- a: 1 -- b: 2 -- c: 3 -');

				innerView.parameters['options'].d = 4;

				setTimeout(() => {
					expect(parent.outerText).to.be.equal('- a: 1 -- b: 2 -- c: 3 -- d: 4 -');
					done();
				}, 100);
			}, 100);
		});

		it('should update view when item is removed from an object', (done) => {
			let parent = document.createElement('ul');
			parent.innerHTML = '<template [s:for]="#key, #value of options"><li>- {{ key + ": " + value }} -</li></template>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.directives.push(ForDirective);
			view.parameters['options'] = {
				a: 1,
				b: 2,
				c: 3,
			};

			compiler.compileElement(view, parent);
			view.watcher.run();

			let innerView = view.children[0];

			setTimeout(() => {
				expect(parent.outerText).to.be.equal('- a: 1 -- b: 2 -- c: 3 -');

				delete innerView.parameters['options'].c;

				setTimeout(() => {
					expect(parent.outerText).to.be.equal('- a: 1 -- b: 2 -');
					done();
				}, 100);
			}, 100);
		});

		it('should create new component, destroy it and create again', (done) => {
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

			let parent = document.createElement('div');
			parent.innerHTML = '<template [s:for]="a in b"><div test>- {{ t.s }} ({{ t.num }}) -</div></template>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			view.directives.push(ForDirective);
			view.directives.push(Test);
			view.parameters['b'] = [];

			compiler.compileElement(view, parent);
			view.watcher.run();

			setTimeout(() => {
				expect(initCalled).to.be.equal(0);
				expect(destroyCalled).to.be.equal(0);
				expect(parent.innerText).to.be.equal('');

				view.parameters['b'].push(null);

				setTimeout(() => {
					expect(initCalled).to.be.equal(1);
					expect(destroyCalled).to.be.equal(0);
					expect(parent.innerText).to.be.equal('- exists (1) -');

					view.parameters['b'].splice(0, 1);

					setTimeout(() => {
						expect(initCalled).to.be.equal(1);
						expect(destroyCalled).to.be.equal(1);
						expect(parent.innerText).to.be.equal('');

						view.parameters['b'].push(null);
						view.parameters['b'].push(null);

						setTimeout(() => {
							expect(initCalled).to.be.equal(3);
							expect(destroyCalled).to.be.equal(1);
							expect(parent.innerText).to.be.equal('- exists (2) -- exists (3) -');

							done();
						}, 150);
					}, 150);
				}, 150);
			}, 150);
		});

	});

});
