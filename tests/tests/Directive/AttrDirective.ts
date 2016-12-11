import {AttrDirective} from '../../../common';

import {createTemplate} from '../_testHelpers';

import chai = require('chai');


let expect = chai.expect;

let parent: HTMLDivElement;


describe('#Directives/AttrDirective', () => {

	beforeEach(() => {
		parent = document.createElement('div');
	});

	it('should add attribute', () => {
		let scope = {
			test: true,
		};

		let template = createTemplate(parent, '<span [s:attr]="{test: test}"></span>', scope, [AttrDirective]);

		expect(parent.children[0]['test']).to.be.equal(true);

		scope.test = false;
		template.checkWatchers();

		expect(parent.children[0]['test']).to.be.equal(false);
	});

});
