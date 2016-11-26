import {Directive, HostEvent} from '../../../core';
import {DirectiveParser} from '../../../src/Entity/DirectiveParser';
import {HostEventMetadataDefinition} from '../../../src/Entity/Metadata';

import chai = require('chai');


let expect = chai.expect;


describe('#Entity/DirectiveParser', () => {

	describe('parse()', () => {

		it('should throw en error for directives without @Directive annotation', () => {
			class Test {}

			expect(() => {
				DirectiveParser.parse(Test);
			}).to.throw(Error, 'Directive Test is not valid directive, please add @Directive() or @Component() annotation.');
		});

		it('should return parsed directive definition', () => {
			@Directive({
				selector: '[test]',
			})
			class Test {
				@HostEvent('mouseover')
				onMouseOver() {}
				@HostEvent('a', 'click')
				onClick() {}
			}

			let definition = DirectiveParser.parse(Test);
			let events = definition.events;

			expect(events).to.have.all.keys('onMouseOver', 'onClick');

			expect(events['onMouseOver']).to.be.an.instanceOf(HostEventMetadataDefinition);
			expect(events['onClick']).to.be.an.instanceOf(HostEventMetadataDefinition);

			expect((<HostEventMetadataDefinition>events['onMouseOver']).el).to.be.equal('@');
			expect((<HostEventMetadataDefinition>events['onMouseOver']).name).to.be.equal('mouseover');
			expect((<HostEventMetadataDefinition>events['onClick']).el).to.be.equal('a');
			expect((<HostEventMetadataDefinition>events['onClick']).name).to.be.equal('click');
		});

	});

});
