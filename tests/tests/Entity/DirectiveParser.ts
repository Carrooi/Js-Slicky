import {Directive, Component, HostEvent, HostElement, Input, Output, Required, ChangeDetectionStrategy, ParentComponent} from '../../../core';
import {EventEmitter} from '../../../utils';
import {DirectiveParser, DirectiveType} from '../../../src/Entity/DirectiveParser';
import {
	HostEventMetadataDefinition, HostElementMetadataDefinition, InputMetadataDefinition, OutputMetadataDefinition,
	ParentComponentDefinition
} from '../../../src/Entity/Metadata';

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

		it('should parse directive', () => {
			@Directive({
				selector: 'directive',
			})
			class TestDirective {
				@Input() @Required() input;
				@Input('custom-name') customInput;
				@HostElement() me;
				@HostElement('button') btn;
				@ParentComponent() parent;
				@HostEvent('mouseover')
				onMouseOver() {}
				@HostEvent('a', 'click')
				onClick() {}
			}

			let definition = DirectiveParser.parse(TestDirective);
			let inputs = definition.inputs;
			let elements = definition.elements;
			let events = definition.events;

			expect(definition.name).to.be.equal('TestDirective');
			expect(definition.type).to.be.equal(DirectiveType.Directive);
			expect(definition.metadata.selector).to.be.equal('directive');

			expect(inputs).to.have.all.keys('input', 'customInput');
			expect(inputs['input']).to.be.an.instanceOf(InputMetadataDefinition);
			expect(inputs['customInput']).to.be.an.instanceOf(InputMetadataDefinition);
			expect((<InputMetadataDefinition>inputs['input']).name).to.be.equal(null);
			expect((<InputMetadataDefinition>inputs['input']).required).to.be.equal(true);
			expect((<InputMetadataDefinition>inputs['customInput']).name).to.be.equal('custom-name');
			expect((<InputMetadataDefinition>inputs['customInput']).required).to.be.equal(false);

			expect(elements).to.have.all.keys('me', 'btn');
			expect(elements['me']).to.be.an.instanceOf(HostElementMetadataDefinition);
			expect(elements['btn']).to.be.an.instanceOf(HostElementMetadataDefinition);
			expect((<HostElementMetadataDefinition>elements['me']).selector).to.be.equal(null);
			expect((<HostElementMetadataDefinition>elements['btn']).selector).to.be.equal('button');

			expect(definition.parentComponent).to.not.be.eql(null);
			expect(definition.parentComponent.property).to.be.equal('parent');
			expect(definition.parentComponent.definition).to.be.an.instanceOf(ParentComponentDefinition);
			expect(definition.parentComponent.definition.type).to.be.equal(null);

			expect(events).to.have.all.keys('onMouseOver', 'onClick');
			expect(events['onMouseOver']).to.be.an.instanceOf(HostEventMetadataDefinition);
			expect(events['onClick']).to.be.an.instanceOf(HostEventMetadataDefinition);
			expect((<HostEventMetadataDefinition>events['onMouseOver']).el).to.be.equal('@');
			expect((<HostEventMetadataDefinition>events['onMouseOver']).name).to.be.equal('mouseover');
			expect((<HostEventMetadataDefinition>events['onClick']).el).to.be.equal('a');
			expect((<HostEventMetadataDefinition>events['onClick']).name).to.be.equal('click');
		});

		it('should throw an error when trying to use more parent components inside of directive', () => {
			@Directive({
				selector: 'directive',
			})
			class TestDirective {
				@ParentComponent() parentA;
				@ParentComponent() parentB;
				@ParentComponent() parentC;
			}

			expect(() => {
				DirectiveParser.parse(TestDirective);
			}).to.throw(Error, 'TestDirective: can not import more than one parent component into parentA, parentB, parentC.');
		});

		it('should parse component', () => {
			class TestDirective {}
			class TestFilter {}

			@Component({
				selector: 'component',
				template: '<div></div>',
				controllerAs: 'cmp',
				changeDetection: ChangeDetectionStrategy.OnPush,
				directives: [TestDirective],
				filters: [TestFilter],
				translations: {en: {hello: 'hello world'}},
			})
			class TestComponent {
				@Output() removed = new EventEmitter<any>();
				@Output('custom-name') customOutput = new EventEmitter<any>();
			}

			let definition = DirectiveParser.parse(TestComponent);
			let outputs = definition.outputs;

			expect(definition.name).to.be.equal('TestComponent');
			expect(definition.type).to.be.equal(DirectiveType.Component);
			expect(definition.metadata.selector).to.be.equal('component');
			expect(definition.metadata.template).to.be.equal('<div></div>');
			expect(definition.metadata.controllerAs).to.be.equal('cmp');
			expect(definition.metadata.changeDetection).to.be.equal(ChangeDetectionStrategy.OnPush);
			expect(definition.metadata.directives).to.be.eql([TestDirective]);
			expect(definition.metadata.filters).to.be.eql([TestFilter]);
			expect(definition.metadata.translations).to.be.eql({en: {hello: 'hello world'}});

			expect(outputs).to.have.all.keys('removed', 'customOutput');
			expect(outputs['removed']).to.be.an.instanceOf(OutputMetadataDefinition);
			expect(outputs['customOutput']).to.be.an.instanceOf(OutputMetadataDefinition);
			expect((<OutputMetadataDefinition>outputs['removed']).name).to.be.equal(null);
			expect((<OutputMetadataDefinition>outputs['customOutput']).name).to.be.equal('custom-name');
		});

	});

});
