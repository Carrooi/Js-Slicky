import {ClassDirective} from '../../../common';

import {createTemplate} from '../_testHelpers';

import chai = require('chai');


let expect = chai.expect;

let parent: HTMLDivElement;


describe('#Directives/ClassDirective', () => {

	beforeEach(() => {
		parent = document.createElement('div');
	});

	it('should attach and detach css classes', () => {
		let scope = {
			show: true,
		};

		let template = createTemplate(parent, '<span [s:class]="{icon: show}"></span>', scope, [ClassDirective]);

		expect(parent.children[0].classList.contains('icon')).to.be.equal(true);

		scope.show = false;
		template.checkWatchers();

		expect(parent.children[0].classList.contains('icon')).to.be.equal(false);
	});

});
