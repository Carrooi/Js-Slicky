import {UpperFilter, SubstrFilter} from '../../../../src/Templating/Filters/DefaultFilters';
import {Filter} from '../../../../src/Templating/Filters/Metadata';
import {AbstractTemplate} from '../../../../src/Templating/Templates/AbstractTemplate';

import {createTemplate} from '../../_testHelpers';


import chai = require('chai');


let expect = chai.expect;
let parent: HTMLDivElement;


describe('#Templating/Compilers/ComponentCompiler.filters', () => {

	beforeEach(() => {
		parent = document.createElement('div');
	});

	describe('compile()', () => {

		it('should use filters', () => {
			createTemplate(parent, '{{ "hello" | upper | substr : 0 : 4 }}', {}, [], [], [UpperFilter, SubstrFilter]);
			expect(parent.innerText).to.be.equal('HELL');
		});

		it('should automatically call filter with current template', () => {
			let called = false;

			@Filter({
				name: 'test',
				injectTemplate: true,
			})
			class TestFilter {
				public transform(template: AbstractTemplate, text: string) {
					called = true;

					expect(template).to.be.an.instanceOf(AbstractTemplate);
					expect(text).to.be.equal('hello');
				}
			}

			createTemplate(parent, '{{ "hello" | test }}', {}, [], [], [TestFilter]);

			expect(called).to.be.equal(true);
		});

	});

});
