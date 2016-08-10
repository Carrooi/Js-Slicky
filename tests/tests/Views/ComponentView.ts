import {ComponentView, ElementRef, TemplateRef} from '../../../core';
import {Container} from '../../../di';
import {Dom} from '../../../utils';
import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';
import {MockApplicationView} from '../../mocks/MockApplicationView';

import chai = require('chai');


let expect = chai.expect;


describe('#Views/ComponentView', () => {

	describe('fork()', () => {

		it('should return forked view', () => {
			var container = new Container;
			let view = new ComponentView(container, new MockApplicationView(container), new ElementRef(document.createElement('div')), {a: 1});

			view.directives = [{}, {}];
			view.filters = {a: () => {}, b: () => {}};

			let fork = view.fork(new ElementRef(document.createElement('div')));

			expect(view.children).to.be.eql([fork]);

			expect(fork.el.nativeEl).to.not.be.equal(view.el.nativeEl);
			expect(fork.parameters).to.be.eql(view.parameters).and.not.equal(view.parameters);
		});

	});

	describe('createEmbeddedView()', () => {

		it('should create new embedded view', () => {
			let templateHTML = '<i>i</i><!-- comment -->text<b>b</b>';
			let el = Dom.el('<div><template>' + templateHTML + '</template></div>');
			let template = el.childNodes[0];

			let elementRef = new ElementRef(el);
			let templateElementRef = new ElementRef(template);
			let templateRef = new TemplateRef(templateElementRef);
			var container = new Container;
			let view = new ComponentView(container, new MockApplicationView(container), elementRef);

			view.createEmbeddedView(templateRef);
			templateElementRef.remove();

			expect(el.innerHTML).to.be.equal(templateHTML + '<!-- -slicky--data- -->');
		});

	});

	describe('watch()', () => {

		it('should notify about changes in parameter', (done) => {
			let el = ElementRef.getByNode(document.createElement('div'));
			var container = new Container;
			let view = new ComponentView(container, new MockApplicationView(container), el, {
				a: 'hello',
			});

			let expr = ExpressionParser.precompile('a');

			view.watch(expr, (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a',
					props: null,
				}]);

				done();
			});

			view.parameters['a'] = 'hello world';
			view.changeDetectorRef.refresh();
		});

	});

});
