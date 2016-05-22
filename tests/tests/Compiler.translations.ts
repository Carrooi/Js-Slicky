import {Compiler} from '../../src/Compiler';
import {OnInit} from '../../src/Interfaces';
import {Container} from '../../di';
import {Dom} from '../../src/Util/Dom';
import {Application, Component, Input} from '../../core';
import {Translator} from '../../src/Translations/Translator';
import {TranslateFilter} from '../../src/Translations/TranslateFilter';
import {View} from '../../src/Views/View';
import {IfDirective} from '../../src/Directives/IfDirective';
import {ForDirective} from '../../src/Directives/ForDirective';
import {ElementRef} from '../../src/Templating/ElementRef';
import {Filter} from '../../src/Templating/Filters/Metadata';
import {Directive} from '../../src/Entity/Metadata';
import {ControllerView} from '../../src/Entity/ControllerView';


import chai = require('chai');


let expect = chai.expect;

let application: Application = null;
let compiler: Compiler = null;


describe('#Compiler/template', () => {

	beforeEach(() => {
		let container = new Container;
		container.provide(Translator);
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	describe('compile()', () => {

		it('should not translate not existing translation', () => {
			@Component({
				selector: 'app',
				template: '{{ "message" | translate }}',
				filters: [TranslateFilter],
				translations: {
					en: {}
				},
			})
			class App {
				constructor(translator: Translator) {
					translator.locale = 'en';
				}
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<app></app>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			compiler.compile(view, App);

			expect(parent.innerText).to.be.equal('message');
		});

		it('should translate simple message', () => {
			@Component({
				selector: 'app',
				template: '{{ "message" | translate }}',
				filters: [TranslateFilter],
				translations: {
					en: {message: 'hello world'}
				},
			})
			class App {
				constructor(translator: Translator) {
					translator.locale = 'en';
				}
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<app></app>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			compiler.compile(view, App);

			expect(parent.innerText).to.be.equal('hello world');
		});

		it('should translate nested message', () => {
			@Component({
				selector: 'app',
				template: '{{ "messages.homepage.headline" | translate }}',
				filters: [TranslateFilter],
				translations: {
					en: {
						messages: {
							homepage: {
								headline: 'hello world',
							},
						},
					},
				},
			})
			class App {
				constructor(translator: Translator) {
					translator.locale = 'en';
				}
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<app></app>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			compiler.compile(view, App);

			expect(parent.innerText).to.be.equal('hello world');
		});

		it('should translate message in plural form without count', () => {
			@Component({
				selector: 'app',
				template: '{{ "message" | translate }}',
				filters: [TranslateFilter],
				translations: {
					en: {message: ['hello world', 'hello worlds']}
				},
			})
			class App {
				constructor(translator: Translator) {
					translator.locale = 'en';
				}
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<app></app>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			compiler.compile(view, App);

			expect(parent.innerText).to.be.equal('hello world');
		});

		it('should translate message in plural form', () => {
			@Component({
				selector: 'app',
				template: '{{ "message" | translate : 1 }}, {{ "message" | translate : 5 }}',
				filters: [TranslateFilter],
				translations: {
					en: {message: ['hello world', 'hello worlds']}
				},
			})
			class App {
				constructor(translator: Translator) {
					translator.locale = 'en';
				}
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<app></app>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			compiler.compile(view, App);

			expect(parent.innerText).to.be.equal('hello world, hello worlds');
		});

		it('should include count in translation', () => {
			@Component({
				selector: 'app',
				template: '{{ "apple" | translate : 1 }}, {{ "apple" | translate : 3 }}',
				filters: [TranslateFilter],
				translations: {
					en: {apple: ['1 apple', '%count% apples']}
				},
			})
			class App {
				constructor(translator: Translator) {
					translator.locale = 'en';
				}
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<app></app>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			compiler.compile(view, App);

			expect(parent.innerText).to.be.equal('1 apple, 3 apples');
		});

		it('should include custom parameters in translation', () => {
			@Component({
				selector: 'app',
				template: '{{ "car" | translate : 1 : {color: "red"} }}, {{ "car" | translate : 9 : {color: "blue"} }}',
				filters: [TranslateFilter],
				translations: {
					en: {car: ['1 %color% car', '%count% %color% cars']}
				},
			})
			class App {
				constructor(translator: Translator) {
					translator.locale = 'en';
				}
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<app></app>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			compiler.compile(view, App);

			expect(parent.innerText).to.be.equal('1 red car, 9 blue cars');
		});

		it('child component should have access to parents translations', () => {
			@Component({
				selector: 'test',
				template: '{{ "apple" | translate }}, {{ "car" | translate }}',
				translations: {
					en: {apple: 'APPLE'},
				},
			})
			class TestComponent {}

			@Component({
				selector: 'app',
				template: '<test></test>',
				filters: [TranslateFilter],
				directives: [TestComponent],
				translations: {
					en: {car: 'CAR'}
				},
			})
			class App {
				constructor(translator: Translator) {
					translator.locale = 'en';
				}
			}

			let parent = document.createElement('div');
			parent.innerHTML = '<app></app>';

			let elementRef = ElementRef.getByNode(parent);
			let view = View.getByElement(elementRef);

			compiler.compile(view, App);

			expect(parent.innerText).to.be.equal('APPLE, CAR');
		});

	});

});
