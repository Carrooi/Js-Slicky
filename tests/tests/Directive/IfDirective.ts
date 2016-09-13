import {Application, Compiler, ComponentView, Component, ElementRef, OnInit, OnDestroy} from '../../../core';
import {IfDirective} from '../../../common';
import {Container} from '../../../di';
import {Dom} from '../../../utils';

import chai = require('chai');


let expect = chai.expect;

let container: Container = null;
let application: Application = null;
let compiler: Compiler = null;


describe('#Directives/IfDirective', () => {

	beforeEach(() => {
		container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	it('should bind new element', () => {
		let el = Dom.el('<div><template [s:if]="!a">hello</template></div>');
		let view = new ComponentView(container, ElementRef.getByNode(el));

		view.directives.push(IfDirective);
		view.scope.setParameter('a', false);

		compiler.compileElement(view, el);

		expect(el.innerText).to.be.equal('hello');
	});

	it('should not bind new element', () => {
		let el = Dom.el('<div><template [s:if]="!a">hello</template></div>');
		let view = new ComponentView(container, ElementRef.getByNode(el));

		view.directives.push(IfDirective);
		view.scope.setParameter('a', true);

		compiler.compileElement(view, el);

		expect(el.innerText).to.be.equal('');
	});

	it('should bind new element after a while and unbind it again', () => {
		let el = Dom.el('<div><template [s:if]="!a">hello</template></div>');
		let view = new ComponentView(container, ElementRef.getByNode(el));

		view.directives.push(IfDirective);
		view.scope.setParameter('a', true);

		compiler.compileElement(view, el);

		expect(el.innerText).to.be.equal('');

		view.scope.setParameter('a', false);
		view.changeDetectorRef.refresh();

		expect(el.innerText).to.be.equal('hello');

		view.scope.setParameter('a', true);
		view.changeDetectorRef.refresh();

		expect(el.innerText).to.be.equal('');
	});

	it('should not create instance of controller if not truthy', () => {
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
		let view = new ComponentView(container, ElementRef.getByNode(el));

		view.directives.push(IfDirective);
		view.directives.push(Test);
		view.scope.setParameter('a', true);

		compiler.compileElement(view, el);

		expect(called).to.be.equal(0);
		expect(el.innerText).to.be.equal('');
	});

	it('should create instance of controller if truthy', () => {
		let called = 0;

		@Component({
			selector: '[test]',
			template: 'hello',
		})
		class Test implements OnInit {
			onInit() {
				called++;
			}
		}

		let el = Dom.el('<div><template [s:if]="!a"><div test></div></template></div>');
		let view = new ComponentView(container, ElementRef.getByNode(el));

		view.directives.push(IfDirective);
		view.directives.push(Test);
		view.scope.setParameter('a', false);

		compiler.compileElement(view, el);

		expect(called).to.be.equal(1);
		expect(el.innerText).to.be.equal('hello');
	});

	it('should create instance of controller, destroy it and create again', () => {
		let initCalled = 0;
		let destroyCalled = 0;

		@Component({
			selector: '[test]',
			controllerAs: 't',
			template: '{{ t.s }}',
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

		let el = Dom.el('<div><template [s:if]="a"><div test></div></template></div>');
		let view = new ComponentView(container, ElementRef.getByNode(el));

		view.directives.push(IfDirective);
		view.directives.push(Test);
		view.scope.setParameter('a', false);

		compiler.compileElement(view, el);

		expect(initCalled).to.be.equal(0);
		expect(destroyCalled).to.be.equal(0);
		expect(el.innerText).to.be.equal('');

		view.scope.setParameter('a', true);
		view.changeDetectorRef.refresh();

		expect(initCalled).to.be.equal(1);
		expect(destroyCalled).to.be.equal(0);
		expect(el.innerText).to.be.equal('exists');

		view.scope.setParameter('a', false);
		view.changeDetectorRef.refresh();

		expect(initCalled).to.be.equal(1);
		expect(destroyCalled).to.be.equal(1);
		expect(el.innerText).to.be.equal('');

		view.scope.setParameter('a', true);
		view.changeDetectorRef.refresh();

		expect(initCalled).to.be.equal(2);
		expect(destroyCalled).to.be.equal(1);
		expect(el.innerText).to.be.equal('exists');
	});

});
