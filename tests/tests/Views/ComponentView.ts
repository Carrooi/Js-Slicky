import {ComponentView, ElementRef} from '../../../core';
import {Container} from '../../../di';
import {ExpressionParser} from '../../../src/Parsers/ExpressionParser';
import {ChangedItem} from '../../../src/Interfaces';
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

			view.watch(expr, (changed: ChangedItem) => {
				expect(changed.action).to.be.equal(ChangeDetectionAction.DeepUpdate);
				expect(changed.dependencies).to.have.length(1);

				expect(changed.dependencies[0].action).to.be.equal(ChangeDetectionAction.Update);
				expect(changed.dependencies[0].expr.code).to.be.equal('a');

				done();
			});

			view.parameters['a'] = 'hello world';
			view.changeDetectorRef.refresh();
		});

	});

});
