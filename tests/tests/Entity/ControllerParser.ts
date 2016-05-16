import {ControllerParser} from '../../../src/Entity/ControllerParser';
import {Component, Input, InputMetadataDefinition, Event, EventMetadataDefinition, Element, ElementMetadataDefinition} from '../../../src/Entity/Metadata';

import chai = require('chai');
import {ComponentMetadataDefinition} from "../../../src/Entity/Metadata";


let expect = chai.expect;


describe('#Entity/ControllerParser', () => {

	describe('getControllerMetadata()', () => {

		it('should throw en error for components without @Component annotation', () => {
			class Test {}

			expect(() => {
				ControllerParser.getControllerMetadata(Test);
			}).to.throw(Error, 'Controller Test is not valid component, please add @Component annotation.');
		});

		it('should return controllers metadata', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				private input1: string;
				@Input('input-2')
				private input2: string;
			}

			let metadata = ControllerParser.getControllerMetadata(Test);

			expect(metadata).to.be.an.instanceof(ComponentMetadataDefinition);
			expect(metadata.selector).to.be.equal('[test]');
		});

	});

	describe('parse()', () => {

		it('should have controllers inputs', () => {
			@Component({selector: '[test]'})
			class Test {
				@Input()
				private input1: string;
				@Input('input-2')
				private input2: string;
			}

			let metadata = ControllerParser.getControllerMetadata(Test);
			let definition = ControllerParser.parse(Test, metadata);
			let inputs = definition.inputs;

			expect(inputs).to.have.all.keys('input1', 'input2');

			expect(inputs['input1']).to.be.an.instanceOf(InputMetadataDefinition);
			expect(inputs['input2']).to.be.an.instanceOf(InputMetadataDefinition);

			expect((<InputMetadataDefinition>inputs['input1']).name).to.be.equal(null);
			expect((<InputMetadataDefinition>inputs['input2']).name).to.be.equal('input-2');
		});

		it('should return controllers events', () => {
			@Component({selector: '[test]'})
			class Test {
				@Event('mouseover')
				onMouseOver() {}
				@Event('a', 'click')
				onClick() {}
			}

			let metadata = ControllerParser.getControllerMetadata(Test);
			let definition = ControllerParser.parse(Test, metadata);
			let events = definition.events;

			expect(events).to.have.all.keys('onMouseOver', 'onClick');

			expect(events['onMouseOver']).to.be.an.instanceOf(EventMetadataDefinition);
			expect(events['onClick']).to.be.an.instanceOf(EventMetadataDefinition);

			expect((<EventMetadataDefinition>events['onMouseOver']).el).to.be.equal('@');
			expect((<EventMetadataDefinition>events['onMouseOver']).name).to.be.equal('mouseover');
			expect((<EventMetadataDefinition>events['onClick']).el).to.be.equal('a');
			expect((<EventMetadataDefinition>events['onClick']).name).to.be.equal('click');
		});

		it('should return controllers elements', () => {
			@Component({selector: '[test]'})
			class Test {
				@Element()
				public test1;
				@Element('button')
				public test2;
			}

			let metadata = ControllerParser.getControllerMetadata(Test);
			let definition = ControllerParser.parse(Test, metadata);
			let elements = definition.elements;

			expect(elements).to.have.all.keys('test1', 'test2');

			expect(elements['test1']).to.be.an.instanceOf(ElementMetadataDefinition);
			expect(elements['test2']).to.be.an.instanceOf(ElementMetadataDefinition);

			expect((<ElementMetadataDefinition>elements['test1']).selector).to.be.equal(null);
			expect((<ElementMetadataDefinition>elements['test2']).selector).to.be.equal('button');
		});

	});

});
