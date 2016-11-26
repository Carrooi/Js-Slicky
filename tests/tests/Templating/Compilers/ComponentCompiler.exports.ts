import {Directive} from '../../../../src/Entity/Metadata';
import {ElementRef} from "../../../../src/Templating/ElementRef";

import {createTemplate} from '../../_testHelpers';


import chai = require('chai');


let expect = chai.expect;
let parent: HTMLDivElement;


describe('#Templating/Compilers/ComponentCompiler.exports', () => {

	beforeEach(() => {
		parent = document.createElement('div');
	});

	describe('compile()', () => {

		it('should export element', () => {
			let scope = createTemplate(parent, '<div #div></div>').scope;

			expect(scope.hasParameter('div')).to.be.equal(true);
			expect(scope.findParameter('div')).to.be.an.instanceOf(HTMLDivElement);
		});

		it('should export element with $this', () => {
			let scope = createTemplate(parent, '<div #div="$this"></div>').scope;

			expect(scope.hasParameter('div')).to.be.equal(true);
			expect(scope.findParameter('div')).to.be.an.instanceOf(HTMLDivElement);
		});

		it('should export one directive when no type is provided', () => {
			@Directive({
				selector: 'directive',
			})
			class TestDirective {}

			let scope = createTemplate(parent, '<directive #directive></directive>', {}, [TestDirective]).scope;

			expect(scope.hasParameter('directive')).to.be.equal(true);
			expect(scope.findParameter('directive')).to.be.an.instanceOf(TestDirective);
		});

		it('should throw an error when no type is provided and element has many directives', () => {
			@Directive({
				selector: 'directive[a]',
			})
			class TestDirectiveA {}

			@Directive({
				selector: 'directive[b]',
			})
			class TestDirectiveB {}

			expect(() => {
				createTemplate(parent, '<directive #directive a b></directive>', {}, [TestDirectiveA, TestDirectiveB]);
			}).to.throw(Error, 'Please, specify exporting type for "directive". Element "directive" has more than one attached directives.');
		});

		it('should throw an error when directive under given name does not exists', () => {
			expect(() => {
				createTemplate(parent, '<directive #directive="Directive"></directive>');
			}).to.throw(Error, 'Can not export directive "Directive" into "directive" on element "directive". Such directive does not exists there.');
		});

		it('should export exact directive', () => {
			@Directive({
				selector: 'directive[a]',
			})
			class TestDirectiveA {}

			@Directive({
				selector: 'directive[b]',
			})
			class TestDirectiveB {}

			let scope = createTemplate(parent, '<directive #directive-a="TestDirectiveA" #directive-b="TestDirectiveB" a b></directive>', {}, [TestDirectiveA, TestDirectiveB]).scope;

			expect(scope.hasParameter('directiveA')).to.be.equal(true);
			expect(scope.hasParameter('directiveB')).to.be.equal(true);
			expect(scope.findParameter('directiveA')).to.be.an.instanceOf(TestDirectiveA);
			expect(scope.findParameter('directiveB')).to.be.an.instanceOf(TestDirectiveB);
		});

		it('should export element into embedded template', () => {
			let scope = {};

			createTemplate(parent, '<template #tmpl="$this"></template>', scope);

			expect(scope).to.not.have.property('tmpl');

			let embeddedTemplate = ElementRef.get(<HTMLElement>parent.childNodes[0]).getTemplateRef().createEmbeddedTemplate();
			let embeddedScope = embeddedTemplate.scope.getParameters();

			expect(scope).to.not.have.property('tmpl');
			expect(embeddedScope).to.have.property('tmpl');
			expect(embeddedScope['tmpl']).to.be.equal(parent.childNodes[0]);
		});

		it('should export dynamic parameter into embedded template', () => {
			let scope = {};

			createTemplate(parent, '<template #letter-a="a" #letter-b="b"></template>', scope);

			expect(scope).to.not.have.property('letterA');
			expect(scope).to.not.have.property('letterB');

			let embeddedTemplate = ElementRef.get(<HTMLElement>parent.childNodes[0]).getTemplateRef().createEmbeddedTemplate({
				a: 'A',
				b: 'B',
			});

			let embeddedScope = embeddedTemplate.scope.getParameters();

			expect(scope).to.not.have.property('letterA');
			expect(scope).to.not.have.property('letterB');
			expect(embeddedScope).to.have.property('letterA');
			expect(embeddedScope).to.have.property('letterB');
			expect(embeddedScope['letterA']).to.be.equal('A');
			expect(embeddedScope['letterB']).to.be.equal('B');
		});

		it('should throw an error when dynamic parameter is missing in embedded template', () => {
			createTemplate(parent, '<template #letter-a="a"></template>');

			expect(() => {
				ElementRef.get(<HTMLElement>parent.childNodes[0]).getTemplateRef().createEmbeddedTemplate();
			}).to.throw(Error, 'Can not export dynamic parameter "letterA" into template. Parameter of type "a" is missing.');
		});

	});

});
