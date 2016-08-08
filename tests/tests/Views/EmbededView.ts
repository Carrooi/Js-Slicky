import {ComponentView, EmbeddedView, ElementRef, TemplateRef} from '../../../core';
import {Dom} from '../../../utils';
import {MockView} from '../../mocks/MockView';

import chai = require('chai');


let expect = chai.expect;


describe('#Views/EmbeddedView', () => {

	describe('attach()', () => {

		it('should attach all child nodes to element', () => {
			let markerHTML = '<!-- marker -->';
			let templateHTML = '<i>i</i><!-- comment -->text<b>b</b>';

			let el = Dom.el('<div>' + markerHTML + '</div>');
			let template = Dom.el('<template>' + templateHTML + '</template>');
			let marker = <Comment>el.childNodes[0];

			let elementRef = new ElementRef(template);
			let templateRef = new TemplateRef(elementRef);

			let view = new ComponentView(new MockView, elementRef);
			let embeddedView = new EmbeddedView(view, templateRef);

			embeddedView.attach(marker);

			expect(el.innerHTML).to.be.equal(templateHTML + markerHTML);
			expect(template.innerHTML).to.be.equal(templateHTML);
		});

		it('should attach all child nodes to element many times', (done) => {
			let markerHTML = '<!-- marker -->';
			let templateHTML = '<i>i</i><!-- comment -->text<b>b</b>';

			let el = Dom.el('<div>' + markerHTML + '</div>');
			let template = Dom.el('<template>' + templateHTML + '</template>');
			let marker = <Comment>el.childNodes[0];

			let elementRef = new ElementRef(template);
			let templateRef = new TemplateRef(elementRef);

			let view = new ComponentView(new MockView, elementRef);

			expect(el.innerHTML).to.be.equal(markerHTML);

			(new EmbeddedView(view, templateRef)).attach(marker);

			expect(el.innerHTML).to.be.equal(templateHTML + markerHTML);
			expect(template.innerHTML).to.be.equal(templateHTML);

			(new EmbeddedView(view, templateRef)).attach(marker);

			expect(el.innerHTML).to.be.equal(templateHTML + templateHTML + markerHTML);
			expect(template.innerHTML).to.be.equal(templateHTML);

			(<HTMLElement>el.childNodes[0]).innerText = 'ii';

			setTimeout(() => {
				expect((<HTMLElement>el.childNodes[4]).innerText).to.be.equal('i');
				done();
			}, 100);
		});

	});

});
