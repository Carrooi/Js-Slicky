import {Application, Compiler, ComponentView, Component, ElementRef, OnInit, OnDestroy} from '../../../core';
import {IfDirective} from '../../../common';
import {Container} from '../../../di';
import {Dom} from '../../../utils';

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
		let el = Dom.el('<div><template [s:if]="!a">hello</template></div>');
		let view = new ComponentView(ElementRef.getByNode(el));

		view.directives.push(IfDirective);
		view.parameters['a'] = false;

		compiler.compileElement(view, el);

		setTimeout(() => {
			expect(el.innerText).to.be.equal('hello');
			done();
		}, 100);
	});

	it('should not bind new element', (done) => {
		let el = Dom.el('<div><template [s:if]="!a">hello</template></div>');
		let view = new ComponentView(ElementRef.getByNode(el));

		view.directives.push(IfDirective);
		view.parameters['a'] = true;

		compiler.compileElement(view, el);

		setTimeout(() => {
			expect(el.innerText).to.be.equal('');
			done();
		}, 100);
	});

	it('should bind new element after a while and unbind it again', (done) => {
		let el = Dom.el('<div><template [s:if]="!a">hello</template></div>');
		let view = new ComponentView(ElementRef.getByNode(el));

		view.directives.push(IfDirective);
		view.parameters['a'] = true;

		compiler.compileElement(view, el);
		view.watcher.run();

		setTimeout(() => {
			expect(el.innerText).to.be.equal('');
			view.parameters['a'] = false;

			setTimeout(() => {
				expect(el.innerText).to.be.equal('hello');
				view.parameters['a'] = true;

				setTimeout(() => {
					expect(el.innerText).to.be.equal('');
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

		let el = Dom.el('<div><template [s:if]="!a"><div test>hello</div></template></div>');
		let view = new ComponentView(ElementRef.getByNode(el));

		view.directives.push(IfDirective);
		view.directives.push(Test);
		view.parameters['a'] = true;

		compiler.compileElement(view, el);

		setTimeout(() => {
			expect(called).to.be.equal(0);
			expect(el.innerText).to.be.equal('');
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

		let el = Dom.el('<div><template [s:if]="!a"><div test>hello</div></template></div>');
		let view = new ComponentView(ElementRef.getByNode(el));

		view.directives.push(IfDirective);
		view.directives.push(Test);
		view.parameters['a'] = false;

		compiler.compileElement(view, el);

		setTimeout(() => {
			expect(called).to.be.equal(1);
			expect(el.innerText).to.be.equal('hello');
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

		let el = Dom.el('<div><template [s:if]="a"><div test>{{ t.s }}</div></template></div>');
		let view = new ComponentView(ElementRef.getByNode(el));

		view.directives.push(IfDirective);
		view.directives.push(Test);
		view.parameters['a'] = false;

		compiler.compileElement(view, el);
		view.watcher.run();

		setTimeout(() => {
			expect(initCalled).to.be.equal(0);
			expect(destroyCalled).to.be.equal(0);
			expect(el.innerText).to.be.equal('');

			view.parameters['a'] = true;

			setTimeout(() => {
				expect(initCalled).to.be.equal(1);
				expect(destroyCalled).to.be.equal(0);
				expect(el.innerText).to.be.equal('exists');

				view.parameters['a'] = false;

				setTimeout(() => {
					expect(initCalled).to.be.equal(1);
					expect(destroyCalled).to.be.equal(1);
					expect(el.innerText).to.be.equal('');

					view.parameters['a'] = true;

					setTimeout(() => {
						expect(initCalled).to.be.equal(2);
						expect(destroyCalled).to.be.equal(1);
						expect(el.innerText).to.be.equal('exists');

						done();
					}, 100);
				}, 100);
			}, 100);
		}, 100);
	});

});
