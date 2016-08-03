import {View} from '../../../src/Views/View';
import {OnInit, OnDestroy} from '../../../src/Interfaces';
import {Application} from '../../../src/Application';
import {Compiler} from '../../../src/Compiler';
import {Container} from '../../../src/DI/Container';
import {Component} from '../../../src/Entity/Metadata';
import {ElementRef} from '../../../src/Templating/ElementRef';
import {IfDirective} from '../../../src/Directives/IfDirective';

import chai = require('chai');


let expect = chai.expect;

let application: Application = null;
let compiler: Compiler = null;


describe('#Directives/IfDirective', () => {

	beforeEach(() => {
		let container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	it('should bind new element', (done) => {
		let parent = document.createElement('div');
		parent.innerHTML = '<template [s:if]="!a">hello</template>';

		let elementRef = ElementRef.getByNode(parent);
		let view = new View(elementRef);

		view.directives.push(IfDirective);
		view.parameters['a'] = false;

		compiler.compileElement(view, parent);

		setTimeout(() => {
			expect(parent.innerText).to.be.equal('hello');
			done();
		}, 100);
	});

	it('should not bind new element', (done) => {
		let parent = document.createElement('div');
		parent.innerHTML = '<template [s:if]="!a">hello</template>';

		let elementRef = ElementRef.getByNode(parent);
		let view = new View(elementRef);

		view.directives.push(IfDirective);
		view.parameters['a'] = true;

		compiler.compileElement(view, parent);

		setTimeout(() => {
			expect(parent.innerText).to.be.equal('');
			done();
		}, 100);
	});

	it('should bind new element after a while and unbind it again', (done) => {
		let parent = document.createElement('div');
		parent.innerHTML = '<template [s:if]="!a">hello</template>';

		let elementRef = ElementRef.getByNode(parent);
		let view = new View(elementRef);

		view.directives.push(IfDirective);
		view.parameters['a'] = true;

		compiler.compileElement(view, parent);
		view.watcher.run();

		setTimeout(() => {
			expect(parent.innerText).to.be.equal('');
			view.parameters['a'] = false;

			setTimeout(() => {
				expect(parent.innerText).to.be.equal('hello');
				view.parameters['a'] = true;

				setTimeout(() => {
					expect(parent.innerText).to.be.equal('');
					done();
				}, 100);
			}, 100);
		}, 100);
	});

	it('should not create instance of controller if not truthy', (done) => {
		let called = 0;

		@Component({
			selector: '[test]',
		})
		class Test implements OnInit {
			onInit() {
				called++;
			}
		}

		let parent = document.createElement('div');
		parent.innerHTML = '<template [s:if]="!a"><div test>hello</div></template>';

		let elementRef = ElementRef.getByNode(parent);
		let view = new View(elementRef);

		view.directives.push(IfDirective);
		view.directives.push(Test);
		view.parameters['a'] = true;

		compiler.compileElement(view, parent);

		setTimeout(() => {
			expect(called).to.be.equal(0);
			expect(parent.innerText).to.be.equal('');
			done();
		}, 100);
	});

	it('should create instance of controller if truthy', (done) => {
		let called = 0;

		@Component({
			selector: '[test]',
		})
		class Test implements OnInit {
			onInit() {
				called++;
			}
		}

		let parent = document.createElement('div');
		parent.innerHTML = '<template [s:if]="!a"><div test>hello</div></template>';

		let elementRef = ElementRef.getByNode(parent);
		let view = new View(elementRef);

		view.directives.push(IfDirective);
		view.directives.push(Test);
		view.parameters['a'] = false;

		compiler.compileElement(view, parent);

		setTimeout(() => {
			expect(called).to.be.equal(1);
			expect(parent.innerText).to.be.equal('hello');
			done();
		}, 100);
	});

	it('should create instance of controller, destroy it and create again', (done) => {
		let initCalled = 0;
		let destroyCalled = 0;

		@Component({
			selector: '[test]',
			controllerAs: 't',
		})
		class Test implements OnInit, OnDestroy {
			public s = 'exists';
			onInit() {
				initCalled++;
			}
			onDestroy() {
				destroyCalled++;
			}
		}

		let parent = document.createElement('div');
		parent.innerHTML = '<template [s:if]="a"><div test>{{ t.s }}</div></template>';

		let elementRef = ElementRef.getByNode(parent);
		let view = new View(elementRef);

		view.directives.push(IfDirective);
		view.directives.push(Test);
		view.parameters['a'] = false;

		compiler.compileElement(view, parent);
		view.watcher.run();

		setTimeout(() => {
			expect(initCalled).to.be.equal(0);
			expect(destroyCalled).to.be.equal(0);
			expect(parent.innerText).to.be.equal('');

			view.parameters['a'] = true;

			setTimeout(() => {
				expect(initCalled).to.be.equal(1);
				expect(destroyCalled).to.be.equal(0);
				expect(parent.innerText).to.be.equal('exists');

				view.parameters['a'] = false;

				setTimeout(() => {
					expect(initCalled).to.be.equal(1);
					expect(destroyCalled).to.be.equal(1);
					expect(parent.innerText).to.be.equal('');

					view.parameters['a'] = true;

					setTimeout(() => {
						expect(initCalled).to.be.equal(2);
						expect(destroyCalled).to.be.equal(1);
						expect(parent.innerText).to.be.equal('exists');

						done();
					}, 100);
				}, 100);
			}, 100);
		}, 100);
	});

});
