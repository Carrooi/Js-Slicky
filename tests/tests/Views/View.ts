import {View} from '../../../src/Views/View';
import {Component} from '../../../src/Entity/Metadata';
import {ControllerParser} from '../../../src/Entity/ControllerParser';
import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';
import {ElementRef} from '../../../src/Templating/ElementRef';
import {TemplateRef} from '../../../src/Templating/TemplateRef';
import {Filter} from '../../../src/Templating/Filters/Metadata';
import {ControllerView} from '../../../src/Entity/ControllerView';
import {Container} from '../../../src/DI/Container';

import chai = require('chai');


let expect = chai.expect;


describe('#Views/View', () => {

	describe('fork()', () => {

		it('should return forked view', () => {
			let view = new View(new ElementRef(document.createElement('div')), {a: 1});

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

			let container = new Container;
			let view = new View(new ElementRef(document.createElement('div')), {a: 1});
			let metadata = ControllerParser.getControllerMetadata(Controller);
			let definition = ControllerParser.parse(Controller, metadata);

			view.updateWithController(container, definition);

			expect(view.parameters).to.be.eql({
				a: 1
			});

			expect(view.directives).to.be.eql(directives);
			expect(view.filters).to.contain.keys(['a']);
			expect(view.filters['a']).to.be.an.instanceof(TestFilter);
			expect(view.entities).to.be.eql([]);
		});

	});

	describe('useDirective()', () => {

		it('should update values with data from controller', () => {
			@Component({
				selector: '[test]',
				controllerAs: 'test',
			})
			class Controller {}

			let view = new View(new ElementRef(document.createElement('div')), {a: 1});
			let controller = new Controller;
			let metadata = ControllerParser.getControllerMetadata(Controller);
			let definition = ControllerParser.parse(Controller, metadata);

			view.attachDirective(definition, controller);

			expect((<ControllerView>view.entities[0]).instance).to.be.eql(controller);
		});

	});

	describe('createEmbeddedView()', () => {

		it('should create new embedded view', () => {
			let parentHTML = '<div></div>';
			let templateHTML = '<i>i</i><!-- comment -->text<b>b</b>';

			let parent = document.createElement('div');
			parent.innerHTML = parentHTML;

			let el = parent.children[0];

			let template = document.createElement('template');
			template.innerHTML = templateHTML;

			let elementRef = new ElementRef(el);

			let templateElementRef = new ElementRef(template);
			let templateRef = new TemplateRef(templateElementRef);

			templateElementRef.moveToMemory();

			let view = new View(elementRef);

			view.createEmbeddedView(templateRef);

			expect(parent.innerHTML).to.be.equal(templateHTML + '<!-- -slicky--data- -->' + parentHTML);
		});

	});

	describe('watch()', () => {

		it('should notify about changes in parameter', (done) => {
			let el = ElementRef.getByNode(document.createElement('div'));
			let view = new View(el, {
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
