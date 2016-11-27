import {IfDirective} from '../../../../src/Directives/IfDirective';
import {ForDirective} from '../../../../src/Directives/ForDirective';
import {IterableDifferFactory} from '../../../../src/ChangeDetection/IterableDiffer';

import {createTemplate} from '../../_testHelpers';


import chai = require('chai');


let expect = chai.expect;
let parent: HTMLDivElement;


describe('#Templating/Compilers/ComponentCompiler.buildInDirectives', () => {

	beforeEach(() => {
		parent = document.createElement('div');
	});

	describe('compile()', () => {

		it('should use IfDirective', () => {
			let scope = {
				visible: true,
			};

			var template = createTemplate(parent, '<div *s:if="visible">visible</div>', scope, [IfDirective]);

			expect(parent.innerText).to.be.equal('visible');

			scope.visible = false;
			template.changeDetector.check();

			expect(parent.innerText).to.be.equal('');
		});

		it('should use ForDirective', () => {
			let scope = {
				users: {
					d: 'David',
					c: 'Clare',
				},
				trackBy: (key) => key,
			};

			createTemplate(parent, '<ul><li *s:for="#name of users; #key=index; trackBy trackBy">- {{ key }}: {{ name }} -</li></ul>', scope, [ForDirective], [IterableDifferFactory]);

			expect(parent.innerText).to.be.equal('- d: David -- c: Clare -');
		});

	});

});
