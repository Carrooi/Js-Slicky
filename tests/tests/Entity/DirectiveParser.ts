import {DirectiveParser} from '../../../src/Entity/DirectiveParser';
import {Directive, DirectiveMetadataDefinition, Event, EventMetadataDefinition} from '../../../src/Entity/Metadata';

import chai = require('chai');


let expect = chai.expect;


describe('#Entity/DirectiveParser', () => {

	describe('getDirectiveMetadata()', () => {

		it('should throw en error for directives without @Directive annotation', () => {
			class Test {}

			expect(() => {
				DirectiveParser.getDirectiveMetadata(Test);
			}).to.throw(Error, 'Directive Test is not valid directive, please add @Directive annotation.');
		});

		it('should get directives metadata', () => {
			@Directive({
				selector: '[test]',
				compileInner: true,
			})
			class Test {}

			let metadata = DirectiveParser.getDirectiveMetadata(Test);

			expect(metadata).to.be.an.instanceof(DirectiveMetadataDefinition);
			expect(metadata.selector).to.be.equal('[test]');
			expect(metadata.compileInner).to.be.equal(true);
		});

	});

	describe('parse()', () => {

		it('should return parsed directive definition', () => {
			@Directive({
				selector: '[test]',
			})
			class Test {
				@Event('mouseover')
				onMouseOver() {}
				@Event('a', 'click')
				onClick() {}
			}

			let metadata = DirectiveParser.getDirectiveMetadata(Test);
			let definition = DirectiveParser.parse(Test, metadata);
			let events = definition.events;

			expect(definition.directive).to.be.equal(Test);

			expect(events).to.have.all.keys('onMouseOver', 'onClick');

			expect(events['onMouseOver']).to.be.an.instanceOf(EventMetadataDefinition);
			expect(events['onClick']).to.be.an.instanceOf(EventMetadataDefinition);

			expect((<EventMetadataDefinition>events['onMouseOver']).el).to.be.equal('@');
			expect((<EventMetadataDefinition>events['onMouseOver']).name).to.be.equal('mouseover');
			expect((<EventMetadataDefinition>events['onClick']).el).to.be.equal('a');
			expect((<EventMetadataDefinition>events['onClick']).name).to.be.equal('click');
		});

	});

});
