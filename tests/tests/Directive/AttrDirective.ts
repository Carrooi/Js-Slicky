import {AttrDirective} from '../../../src/Directives/AttrDirective';
import {Compiler} from '../../../src/Compiler';
import {View} from '../../../src/Views/View';
import {Container} from '../../../src/DI/Container';
import {Application} from '../../../src/Application';
import {ElementRef} from '../../../src/Templating/ElementRef';

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
		let parent = document.createElement('div');
		parent.innerHTML = '<span [s:attr]="{test: true}"></span>';

		let el = <HTMLElement>parent.children[0];
		let elementRef = new ElementRef(el);

		let view = new View(elementRef);

		view.directives.push(AttrDirective);

		expect(el['test']).to.be.equal(undefined);

		compiler.compileElement(view, el);

		expect(el['test']).to.be.equal(true);
	});

});
