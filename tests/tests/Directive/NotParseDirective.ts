import {Application, Compiler, ApplicationView, Component, ElementRef} from '../../../core';
import {NotParseDirective} from '../../../common';
import {Container} from '../../../di';
import {Dom} from '../../../utils';

import chai = require('chai');


let expect = chai.expect;

let container: Container = null;
let application: Application = null;
let compiler: Compiler = null;


describe('#Directives/NotParseDirective', () => {

	beforeEach(() => {
		container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	it('should not parse inner html', () => {
		@Component({
			selector: '[test]',
			directives: [NotParseDirective],
			template: '{{ a }}, <span>{{ a }}</span>, <span [s:not-parse]>{{ a }}</span>',
		})
		class Test {}

		let el = Dom.el('<div><div test></div></div>');
		let view = new ApplicationView(container, ElementRef.getByNode(el), [Test], {
			a: 42,
		});

		compiler.compile(view);

		expect(el.innerText).to.be.equal('42, 42, {{ a }}');
	});

});
