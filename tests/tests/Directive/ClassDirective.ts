import {ClassDirective} from '../../../src/Directives/ClassDirective';
import {Compiler} from '../../../src/Compiler';
import {View} from '../../../src/Views/View';
import {Container} from '../../../src/DI/Container';
import {Application} from '../../../src/Application';
import {ElementRef} from '../../../src/Templating/ElementRef';

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
		let parent = document.createElement('div');
		parent.innerHTML = '<span [s:class]="{icon: true}"></span>';

		let el = <HTMLElement>parent.children[0];
		let elementRef = new ElementRef(el);

		let view = new View(elementRef);

		view.directives.push(ClassDirective);

		expect(el.classList.contains('icon')).to.be.equal(false);

		compiler.compileElement(view, el);

		expect(el.classList.contains('icon')).to.be.equal(true);
	});

	it('should remove existing css class', () => {
		let parent = document.createElement('div');
		parent.innerHTML = '<span [s:class]="{icon: false}" class="icon"></span>';

		let el = <HTMLElement>parent.children[0];
		let elementRef = new ElementRef(el);

		let view = new View(elementRef);

		view.directives.push(ClassDirective);

		expect(el.classList.contains('icon')).to.be.equal(true);

		compiler.compileElement(view, el);

		expect(el.classList.contains('icon')).to.be.equal(false);
	});

});
