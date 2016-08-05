import {Application, Compiler, ComponentView, ElementRef} from '../../../../core';
import {Container} from '../../../../di';
import {Dom} from '../../../../utils';
import {EventBinding} from '../../../../src/Templating/Binding/EventBinding';
import {ExpressionParser} from '../../../../src/Parsers/ExpressionParser';

import chai = require('chai');


let expect = chai.expect;

let application: Application = null;
let compiler: Compiler = null;


describe('#Templating/Binding/EventBinding', () => {

	beforeEach(() => {
		let container = new Container;
		application = new Application(container);
		compiler = container.get(<any>Compiler);
	});

	it("should bind simple value to element's property", (done) => {
		let el = Dom.el('<a href="#" (click)="onClick($event)"></a>');

		expect(el['test']).to.be.equal(undefined);

		let view = new ComponentView(new ElementRef(el), {
			onClick: function(e: Event) {
				expect(e).to.be.an.instanceOf(Event);
				done();
			},
		});

		let binding = new EventBinding(view, el, 'click', 'onClick($event)');

		view.attachBinding(binding, ExpressionParser.precompile('onClick($event)'));
		el.dispatchEvent(Dom.createMouseEvent('click'));
	});

	it('should call event listener on objects function', (done) => {
		let el = Dom.el('<a href="#" (click)="obj.onClick($event)"></a>');

		expect(el['test']).to.be.equal(undefined);

		let view = new ComponentView(new ElementRef(el), {
			obj: {
				onClick: function(e: Event) {
					expect(e).to.be.an.instanceOf(Event);
					expect(this).to.be.equal(view.parameters['obj']);
					done();
				},
			},
		});

		let binding = new EventBinding(view, el, 'click', 'obj.onClick($event)');

		view.attachBinding(binding, ExpressionParser.precompile('obj.onClick($event)'));
		el.dispatchEvent(Dom.createMouseEvent('click'));
	});

	it('should pass different parameters to event function', (done) => {
		let code = 'onClick(1, \'a\', $event, onClick, 5 + \'b\')';
		let el = Dom.el('<a href="#" (click)="' + code + '"></a>');

		expect(el['test']).to.be.equal(undefined);

		let view = new ComponentView(new ElementRef(el), {
			onClick: function(num: number, letter: string, e: Event, fn: Function, mixed: string) {
				expect(num).to.be.equal(1);
				expect(letter).to.be.equal('a');
				expect(e).to.be.an.instanceOf(Event);
				expect(fn).to.be.equal(view.parameters['onClick']);
				expect(mixed).to.be.equal('5b');
				done();
			},
		});

		let binding = new EventBinding(view, el, 'click', code);

		view.attachBinding(binding, ExpressionParser.precompile(code));
		el.dispatchEvent(Dom.createMouseEvent('click'));
	});

	it('should pass calling element to listener', (done) => {
		let code = 'onClick($event, $this)';
		let el = Dom.el('<a href="#" (click)="' + code + '"></a>');

		expect(el['test']).to.be.equal(undefined);

		let view = new ComponentView(new ElementRef(el), {
			onClick: function(e: Event, targetEl: HTMLLinkElement) {
				expect(e).to.be.an.instanceOf(Event);
				expect(targetEl).to.be.equal(el);
				done();
			},
		});

		let binding = new EventBinding(view, el, 'click', code);

		view.attachBinding(binding, ExpressionParser.precompile(code));
		el.dispatchEvent(Dom.createMouseEvent('click'));
	});

	it('should call event without any attributes', (done) => {
		let el = Dom.el('<a href="#" (click)="onClick()"></a>');

		expect(el['test']).to.be.equal(undefined);

		let view = new ComponentView(new ElementRef(el), {
			onClick: function() {
				done();
			},
		});

		let binding = new EventBinding(view, el, 'click', 'onClick()');

		view.attachBinding(binding, ExpressionParser.precompile('onClick()'));
		el.dispatchEvent(Dom.createMouseEvent('click'));
	});

	it('should call many event listeners from one definition', (done) => {
		let code = 'obj.onChange($event)';
		let called = 0;

		let el = Dom.el('<a href="#" (click|mousedown)="' + code + '"></a>');
		let view = new ComponentView(new ElementRef(el), {
			obj: {
				onChange: function(e: Event) {
					expect(e).to.be.an.instanceOf(Event);
					expect(this).to.be.equal(view.parameters['obj']);

					called++;
				},
			},
		});

		let binding = new EventBinding(view, el, 'click|mousedown', code);

		view.attachBinding(binding, ExpressionParser.precompile(code));
		el.dispatchEvent(Dom.createMouseEvent('click'));
		el.dispatchEvent(Dom.createMouseEvent('mousedown'));

		setTimeout(() => {
			expect(called).to.be.equal(2);
			done();
		}, 100);
	});

});
