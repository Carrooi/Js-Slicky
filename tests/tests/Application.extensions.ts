import {Application, Component, OnInit} from '../../core';
import {Container} from '../../di';
import {Injectable} from '../../src/DI/Metadata';
import {AbstractExtension} from '../../src/Extensions/AbstractExtension';
import {Filter} from '../../src/Templating/Filters/Metadata';

import chai = require('chai');


let expect = chai.expect;
let parent: HTMLDivElement;
let application: Application = null;


describe('#Application.extensions', () => {

	beforeEach(() => {
		parent = document.createElement('div');
		let container = new Container;
		application = new Application(container);
	});
	
	describe('run()', () => {

		it('should add custom extension', () => {
			@Injectable()
			class TestService {}

			@Injectable()
			class TestComponentService {}

			@Filter({
				name: 'append',
			})
			class TestFilter {
				transform(str, append) {
					return str + append;
				}
			}

			@Component({
				selector: 'extension',
				template: 'David',
			})
			class TestExtensionComponent {}

			class TestExtension extends AbstractExtension {
				getServices() {
					return [TestService];
				}
				getFilters() {
					return [TestFilter];
				}
				getDirectives() {
					return [TestExtensionComponent];
				}
				doUpdateComponentServices(template, el, services) {
					services.push({
						service: TestComponentService,
					});
				}
			}

			let called = false;

			@Component({
				selector: 'component',
				template: '{{ "hello" | append : " world" }}, <extension></extension>',
			})
			class TestComponent implements OnInit {
				constructor(private testService: TestService, private testComponentService: TestComponentService) {}
				onInit() {
					expect(this.testService).to.be.an.instanceOf(TestService);
					expect(this.testComponentService).to.be.an.instanceOf(TestComponentService);

					called = true;
				}
			}

			application.addExtension(TestExtension);

			parent.innerHTML = '<component></component>';

			application.run([TestComponent], {
				parentElement: parent,
			});

			expect(called).to.be.equal(true);
			expect(parent.innerText).to.be.equal('hello world, David');
		});
		
	});

});
