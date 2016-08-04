import {ApplicationView} from '../../../src/Views/ApplicationView';
import {Application} from '../../../src/Application';
import {Compiler} from '../../../src/Compiler';
import {Container} from '../../../src/DI/Container';
import {Component} from '../../../src/Entity/Metadata';
import {NotParseDirective} from '../../../src/Directives/NotParseDirective';

import chai = require('chai');


let expect = chai.expect;

let application: Application = null;
let compiler: Compiler = null;


describe('#Directives/NotParseDirective', () => {

	beforeEach(() => {
		let container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	it('should not parse inner html', () => {
		@Component({
			selector: '[test]',
			directives: [NotParseDirective],
		})
		class Test {}

		let parent = document.createElement('div');

		parent.innerHTML = '<div test>{{ a }}, <span>{{ a }}</span>, <span [s:not-parse]>{{ a }}</span></div>';

		let view = new ApplicationView(parent, Test, {
			a: 42,
		});

		compiler.compile(view);

		expect(parent.innerText).to.be.equal('42, 42, {{ a }}');
	});

});
