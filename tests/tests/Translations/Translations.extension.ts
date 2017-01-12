import {Component, OnInit} from '../../../core';
import {TranslationsExtension} from '../../../src/Translations/TranslationsExtension';
import {ComponentTranslator} from '../../../src/Translations/ComponentTranslator';
import {runApplication} from '../_testHelpers';

import chai = require('chai');


let expect = chai.expect;
let parent: HTMLDivElement;


describe('#Translations/Translations.extension', () => {

	beforeEach(() => {
		parent = document.createElement('div');
	});
	
	describe('run()', () => {

		it('should add translator with extension', () => {
			let called = false;

			@Component({
				selector: 'component',
				template: '{{ "apples" | translate }}',
				translations: {
					en: {
						apples: 'Apples',
					},
				},
			})
			class TestComponent implements OnInit {
				constructor(private translator: ComponentTranslator) {}
				onInit() {
					expect(this.translator.translate('apples')).to.be.equal('Apples');

					called = true;
				}
			}

			parent.innerHTML = '<component></component>';

			runApplication([TestComponent], {
				parentElement: parent,
			}, [
				new TranslationsExtension({
					locale: 'en',
				}),
			]);

			expect(called).to.be.equal(true);
			expect(parent.innerText).to.be.equal('Apples');
		});
		
	});

});
