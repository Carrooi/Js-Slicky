import {ClassDirective} from '../../../common';
import {Application, Compiler, ComponentView, ElementRef} from '../../../core';
import {Container} from '../../../di';
import {Dom} from '../../../utils';
import {MockView} from '../../mocks/MockView';

import chai = require('chai');


let expect = chai.expect;

let application: Application = null;
let compiler: Compiler = null;


describe('#Directives/ClassDirective', () => {

	beforeEach(() => {
		let container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	it('should add new css class', () => {
		let el = Dom.el('<span [s:class]="{icon: true}"></span>');
		let elementRef = new ElementRef(el);

		let view = new ComponentView(new MockView, elementRef);
		view.directives.push(ClassDirective);

		expect(el.classList.contains('icon')).to.be.equal(false);

		compiler.compileElement(view, el);

		expect(el.classList.contains('icon')).to.be.equal(true);
	});

	it('should remove existing css class', () => {
		let el = Dom.el('<span [s:class]="{icon: false}" class="icon"></span>');
		let elementRef = new ElementRef(el);

		let view = new ComponentView(new MockView, elementRef);
		view.directives.push(ClassDirective);

		expect(el.classList.contains('icon')).to.be.equal(true);

		compiler.compileElement(view, el);

		expect(el.classList.contains('icon')).to.be.equal(false);
	});

});
