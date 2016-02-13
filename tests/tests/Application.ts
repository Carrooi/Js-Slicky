import {Container} from '../../di';
import {Application, Component, Input, Event, Element} from '../../core';
import {InputMetadataDefinition, EventMetadataDefinition, ElementMetadataDefinition} from '../../src/Controller/Metadata';

import chai = require('chai');


let expect = chai.expect;
let application: Application = null;


describe('#Application', () => {

	beforeEach(() => {
		let container = new Container;
		application = new Application(container);
	});

	describe('registerController()', () => {

		it('should throw en error for components without @Component annotation', () => {
			class Test {}

			expect(() => {
				application.registerController(Test);
			}).to.throw(Error, 'Controller Test is not valid component, please add @Component annotation.');
		});

	});

	describe('hasController()', () => {

		it('should return false', () => {
			expect(application.hasController('test')).to.be.equal(false);
		});

		it('should return true', () => {
			@Component({name: 'test'})
			class Test {}

			application.registerController(Test);

			expect(application.hasController('test')).to.be.equal(true);
		});

	});

	describe('createController()', () => {

		it('should throw an error for not registered component', () => {
			expect(() => {
				application.createController('test');
			}).to.throw(Error, 'Component test is not registered.');
		});

		it('should create instance of entity', () => {
			@Component({name: 'test'})
			class Test {}

			application.registerController(Test);

			let test = application.createController('test');

			expect(test).to.be.an.instanceOf(Test);
		});

	});

	describe('getControllerInputs()', () => {

		it('should throw an error for not registered component', () => {
			expect(() => {
				application.getControllerInputs('test');
			}).to.throw(Error, 'Component test is not registered.');
		});

		it('should return controllers events', () => {
			@Component({name: 'test'})
			class Test {
				@Input()
				private input1: string;
				@Input('input-2')
				private input2: string;
			}

			application.registerController(Test);

			let inputs = application.getControllerInputs('test');

			expect(inputs).to.have.all.keys('input1', 'input2');

			expect(inputs['input1']).to.be.an.instanceOf(InputMetadataDefinition);
			expect(inputs['input2']).to.be.an.instanceOf(InputMetadataDefinition);

			expect((<InputMetadataDefinition>inputs['input1']).hasName()).to.be.equal(false);
			expect((<InputMetadataDefinition>inputs['input2']).hasName()).to.be.equal(true);
			expect((<InputMetadataDefinition>inputs['input2']).getName()).to.be.equal('input-2');
		});

	});

	describe('getControllerEvents()', () => {

		it('should throw an error for not registered component', () => {
			expect(() => {
				application.getControllerEvents('test');
			}).to.throw(Error, 'Component test is not registered.');
		});

		it('should return controllers inputs', () => {
			@Component({name: 'test'})
			class Test {
				@Event('mouseover')
				onMouseOver() {}
				@Event('a', 'click')
				onClick() {}
			}

			application.registerController(Test);

			let events = application.getControllerEvents('test');

			expect(events).to.have.all.keys('onMouseOver', 'onClick');

			expect(events['onMouseOver']).to.be.an.instanceOf(EventMetadataDefinition);
			expect(events['onClick']).to.be.an.instanceOf(EventMetadataDefinition);

			expect((<EventMetadataDefinition>events['onMouseOver']).getEl()).to.be.equal('@');
			expect((<EventMetadataDefinition>events['onMouseOver']).getName()).to.be.equal('mouseover');
			expect((<EventMetadataDefinition>events['onClick']).getEl()).to.be.equal('a');
			expect((<EventMetadataDefinition>events['onClick']).getName()).to.be.equal('click');
		});

	});

	describe('getControllerElements()', () => {

		it('should throw an error for not registered component', () => {
			expect(() => {
				application.getControllerElements('test');
			}).to.throw(Error, 'Component test is not registered.');
		});

		it('should return controllers inputs', () => {
			@Component({name: 'test'})
			class Test {
				@Element()
				public test1;
				@Element('button')
				public test2;
			}

			application.registerController(Test);

			let elements = application.getControllerElements('test');

			expect(elements).to.have.all.keys('test1', 'test2');

			expect(elements['test1']).to.be.an.instanceOf(ElementMetadataDefinition);
			expect(elements['test2']).to.be.an.instanceOf(ElementMetadataDefinition);

			expect((<ElementMetadataDefinition>elements['test1']).hasSelector()).to.be.equal(false);
			expect((<ElementMetadataDefinition>elements['test2']).hasSelector()).to.be.equal(true);
			expect((<ElementMetadataDefinition>elements['test2']).getSelector()).to.be.equal('button');
		});

	});

});
