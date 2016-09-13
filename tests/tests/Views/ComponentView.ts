import {ComponentView, ElementRef} from '../../../core';
import {Container} from '../../../di';
import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';
import {ChangeDetectionAction} from '../../../src/constants';

import chai = require('chai');


let expect = chai.expect;


describe('#Views/ComponentView', () => {

	describe('watch()', () => {

		it('should notify about changes in parameter', (done) => {
			let el = ElementRef.getByNode(document.createElement('div'));
			var container = new Container;
			let view = new ComponentView(container, el, null, {
				a: 'hello',
			});

			let expr = ExpressionParser.parse('a');

			view.watch(expr, true, () => {
				done();
			});

			view.scope.setParameter('a', 'hello world');
			view.changeDetectorRef.refresh();
		});

	});

});
