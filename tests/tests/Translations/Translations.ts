import {TranslateFilter} from '../../../src/Translations/TranslateFilter';
import {Component} from '../../../src/Entity/Metadata';

import {createTemplate} from '../_testHelpers';


import chai = require('chai');


let expect = chai.expect;
let parent: HTMLDivElement;


describe('#Translations/Translations', () => {

	beforeEach(() => {
		parent = document.createElement('div');
	});

	describe('translate()', () => {

		it('should not translate not existing messages', () => {
			createTemplate(parent, '{{ "message" | translate }}', {}, [], [], [TranslateFilter]);
			expect(parent.innerText).to.be.equal('message');
		});

		it('should translate simple message', () => {
			createTemplate(parent, '{{ "message" | translate }}', {}, [], [], [TranslateFilter], {message: 'hello world'});
			expect(parent.innerText).to.be.equal('hello world');
		});

		it('should translate nested message', () => {
			createTemplate(parent, '{{ "messages.homepage.headline" | translate }}', {}, [], [], [TranslateFilter], {
				messages: {
					homepage: {
						headline: 'hello world',
					},
				},
			});

			expect(parent.innerText).to.be.equal('hello world');
		});

		it('should translate message in plural form without count', () => {
			createTemplate(parent, '{{ "message" | translate }}', {}, [], [], [TranslateFilter], {message: ['hello world', 'hello worlds']});
			expect(parent.innerText).to.be.equal('hello world');
		});

		it('should translate message in plural form', () => {
			createTemplate(parent, '{{ "message" | translate : 1 }}, {{ "message" | translate : 5 }}', {}, [], [], [TranslateFilter], {message: ['hello world', 'hello worlds']});
			expect(parent.innerText).to.be.equal('hello world, hello worlds');
		});

		it('should include count in translation', () => {
			createTemplate(parent, '{{ "apple" | translate : 1 }}, {{ "apple" | translate : 3 }}', {}, [], [], [TranslateFilter], {apple: ['1 apple', '%count% apples']});
			expect(parent.innerText).to.be.equal('1 apple, 3 apples');
		});

		it('should include custom parameters in translation', () => {
			createTemplate(parent, '{{ "car" | translate : 1 : {color: "red"} }}, {{ "car" | translate : 9 : {color: "blue"} }}', {}, [], [], [TranslateFilter], {car: ['1 %color% car', '%count% %color% cars']});
			expect(parent.innerText).to.be.equal('1 red car, 9 blue cars');
		});

		it('should use translations from parent component', () => {
			@Component({
				selector: 'component',
				template: '{{ "apple" | translate }}, {{ "car" | translate }}',
				translations: {
					en: {apple: 'APPLE'},
				},
			})
			class TestComponent {}

			createTemplate(parent, '<component></component>', {}, [TestComponent], [], [TranslateFilter], {car: 'CAR'});

			expect(parent.innerText).to.be.equal('APPLE, CAR');
		});

		it('should translate message in attribute', () => {
			createTemplate(parent, '<div title="{{ \'message\' | translate }}"></div>', {}, [], [], [TranslateFilter], {message: 'hello world'});
			expect(parent.innerHTML).to.be.equal('<div title="hello world"></div>');
		});

	});

});
