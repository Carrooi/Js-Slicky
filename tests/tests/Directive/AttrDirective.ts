import {AttrDirective} from '../../../common';
import {Application, Compiler, View, ElementRef} from '../../../core';
import {Container} from '../../../di';
import {Dom} from '../../../utils';

import chai = require('chai');


let expect = chai.expect;

let application: Application = null;
let compiler: Compiler = null;


describe('#Directives/AttrDirective', () => {

	beforeEach(() => {
		let container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	it('should add attribute', () => {
		let el = Dom.el('<span [s:attr]="{test: true}"></span>');
		let elementRef = new ElementRef(el);

		let view = new View(elementRef);
		view.directives.push(AttrDirective);

		expect(el['test']).to.be.equal(undefined);

		compiler.compileElement(view, el);

		expect(el['test']).to.be.equal(true);
	});

});
