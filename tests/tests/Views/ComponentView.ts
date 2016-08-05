import {ComponentView, Component, Directive, ElementRef, TemplateRef, Filter} from '../../../core';
import {Container} from '../../../di';
import {Dom} from '../../../utils';
import {ControllerParser} from '../../../src/Entity/ControllerParser';
import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';

import chai = require('chai');


let expect = chai.expect;


describe('#Views/ComponentView', () => {

	describe('fork()', () => {

		it('should return forked view', () => {
			let view = new ComponentView(new ElementRef(document.createElement('div')), {a: 1});

			view.directives = [{}, {}];
			view.filters = {a: () => {}, b: () => {}};

			let fork = view.fork(new ElementRef(document.createElement('div')));

			expect(view.children).to.be.eql([fork]);

			expect(fork.el.nativeEl).to.not.be.equal(view.el.nativeEl);
			expect(fork.parameters).to.be.eql(view.parameters).and.not.equal(view.parameters);
		});

	});

	describe('updateWithController()', () => {

		it('should update values with data from controller', () => {
			@Filter({
				name: 'a',
			})
			class TestFilter {
				transform() {}
			}

			let directives = [{}, {}];

			@Component({
				selector: '[test]',
				controllerAs: 'test',
				directives: directives,
				filters: [TestFilter],
			})
			class Controller {}

			let component = new Controller;
			let container = new Container;
			let view = new ComponentView(new ElementRef(document.createElement('div')), {a: 1});
			let metadata = ControllerParser.getControllerMetadata(Controller);
			let definition = ControllerParser.parse(Controller, metadata);

			view.setComponent(container, definition, component);

			expect(view.parameters).to.be.eql({
				a: 1,
				test: component,
			});

			expect(view.directives).to.be.eql(directives);
			expect(view.filters).to.contain.keys(['a']);
			expect(view.filters['a']).to.be.an.instanceof(TestFilter);
			expect(view.attachedDirectives).to.be.eql([]);
			expect(view.component).to.be.an.instanceof(Controller);
		});

	});

	describe('useDirective()', () => {

		it('should attach new directive', () => {
			@Directive({
				selector: '[test]',
			})
			class Test {}

			let view = new ComponentView(new ElementRef(document.createElement('div')), {a: 1});
			let test = new Test;

			view.attachDirective(test);

			expect(view.attachedDirectives[0]).to.be.eql(test);
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
			let view = new ComponentView(elementRef);

			view.createEmbeddedView(templateRef);
			templateElementRef.remove();

			expect(el.innerHTML).to.be.equal(templateHTML + '<!-- -slicky--data- -->');
		});

	});

	describe('watch()', () => {

		it('should notify about changes in parameter', (done) => {
			let el = ElementRef.getByNode(document.createElement('div'));
			let view = new ComponentView(el, {
				a: 'hello',
			});

			view.watcher.run();

			let expr = ExpressionParser.precompile('a');

			view.watch(expr, (changed) => {
				expect(changed).to.be.eql([{
					expr: 'a',
					props: null,
				}]);

				done();
			});

			view.parameters['a'] = 'hello world';
		});

	});

});
