import {Application, Component, OnInit} from '../../../core';
import {Container} from '../../../di';
import {TranslationsExtension} from '../../../src/Translations/TranslationsExtension';
import {ComponentTranslator} from '../../../src/Translations/ComponentTranslator';

import chai = require('chai');


let expect = chai.expect;
let parent: HTMLDivElement;
let application: Application = null;


describe('#Translations/Translations.extension', () => {

	beforeEach(() => {
		parent = document.createElement('div');
		let container = new Container;
		application = new Application(container);
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

			application.addExtension(new TranslationsExtension({
				locale: 'en',
			}));

			parent.innerHTML = '<component></component>';

			application.run([TestComponent], {
				parentElement: parent,
			});

			expect(called).to.be.equal(true);
			expect(parent.innerText).to.be.equal('Apples');
		});
		
	});

});
