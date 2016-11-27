import {ComponentCompiler} from '../../../../src/Templating/Compilers/ComponentCompiler';
import {Dom} from '../../../../src/Util/Dom';
import {ElementRef} from '../../../../src/Templating/ElementRef';

import {createTemplate} from '../../_testHelpers';


import chai = require('chai');


let expect = chai.expect;
let parent: HTMLDivElement;


describe('#Templating/Compilers/ComponentCompiler', () => {

	beforeEach(() => {
		parent = document.createElement('div');
	});

	describe('compile()', () => {

		it('should compile template with text', () => {
			createTemplate(parent, 'hello world');
			expect(parent.innerHTML).to.be.equal('hello world');
		});

		it('should compile template with element', () => {
			createTemplate(parent, '<div>lorem ipsum</div>');
			expect(parent.innerHTML).to.be.equal('<div>lorem ipsum</div>');
		});

		it('should compile template with native attributes', () => {
			createTemplate(parent, '<div class="alert"></div>');
			expect(parent.innerHTML).to.be.equal('<div class="alert"></div>');
		});

		it('should compile template with event attribute', (done) => {
			createTemplate(parent, '<button (click)="click($this, $event, \'hello\')"></button>', {
				click: (button: ElementRef, e: MouseEvent, message: string) => {
					expect(button).to.be.an.instanceOf(ElementRef);
					expect(button.nativeElement).to.be.an.instanceOf(HTMLButtonElement);
					expect(e).to.be.an.instanceOf(MouseEvent);
					expect(message).to.be.equal('hello');

					done();
				},
			});

			expect(parent.innerHTML).to.be.equal('<button></button>');

			parent.children[0].dispatchEvent(Dom.createMouseEvent('click'));
		});

		it('should compile template with multi event attribute', (done) => {
			let counter = 0;

			createTemplate(parent, '<button (hover|click)="doSomething($event.type)"></button>', {
				doSomething: (type: string) => {
					expect(type).to.be.oneOf(['hover', 'click']);

					counter++;

					if (counter >= 2) {
						done();
					}
				},
			});

			parent.children[0].dispatchEvent(Dom.createMouseEvent('click'));
			parent.children[0].dispatchEvent(Dom.createMouseEvent('hover'));
			parent.children[0].dispatchEvent(Dom.createMouseEvent('mouseout'));
		});

		it('should compile template with single expression in attribute', () => {
			let scope = {
				type: 'danger'
			};

			let template = createTemplate(parent, '<div class="{{ type }}"></div>', scope);

			expect(parent.innerHTML).to.be.equal('<div class="danger"></div>');

			scope.type = 'success';
			template.changeDetector.check();

			expect(parent.innerHTML).to.be.equal('<div class="success"></div>');
		});

		it('should compile template with expression in attribute', () => {
			let scope = {
				type: 'danger'
			};

			let template = createTemplate(parent, '<div class="alert-{{ type }}"></div>', scope);

			expect(parent.innerHTML).to.be.equal('<div class="alert-danger"></div>');

			scope.type = 'success';
			template.changeDetector.check();

			expect(parent.innerHTML).to.be.equal('<div class="alert-success"></div>');
		});

		it('should compile template with property attribute', () => {
			let scope = {
				type: 'danger',
			};

			let template = createTemplate(parent, '<div [class]="\'alert-\' + type"></div>', scope);

			expect(parent.innerHTML).to.be.equal('<div class="alert-danger"></div>');

			scope.type = 'success';
			template.changeDetector.check();

			expect(parent.innerHTML).to.be.equal('<div class="alert-success"></div>');
		});

		it('should compile text expression', () => {
			let scope = {
				beginning: 'hello',
				ending: 'world',
			};

			var template = createTemplate(parent, '{{ beginning }}, {{ ending }}!', scope);

			expect(parent.innerHTML).to.be.equal('hello, world!');

			scope.beginning = 'lorem';
			scope.ending = 'ipsum';
			template.changeDetector.check();

			expect(parent.innerHTML).to.be.equal('lorem, ipsum!');
		});

		it('should compile template with inner elements', () => {
			createTemplate(parent, '<div><span></span></div><button></button>');
			expect(parent.innerHTML).to.be.equal('<div><span></span></div><button></button>');
		});

		it('should compile template with template element', () => {
			createTemplate(parent, '<template><div><template><div></div></template></div></template>');

			expect(parent.innerHTML).to.be.equal('<template></template>');

			ElementRef.get(<HTMLElement>parent.childNodes[0]).getTemplateRef().createEmbeddedTemplate();

			expect(parent.innerHTML).to.be.equal('<div><template></template></div><template></template>');

			ElementRef.get(<HTMLElement>parent.querySelector('div template')).getTemplateRef().createEmbeddedTemplate();

			expect(parent.innerHTML).to.be.equal('<div><div></div><template></template></div><template></template>');
		});

		it('should remove embedded template', () => {
			createTemplate(parent, '<template>hello</template>');

			expect(parent.innerHTML).to.be.equal('<template></template>');

			let embeddedTemplate = ElementRef.get(<HTMLElement>parent.childNodes[0]).getTemplateRef().createEmbeddedTemplate();

			expect(parent.innerHTML).to.be.equal('hello<template></template>');
			
			embeddedTemplate.remove();

			expect(parent.innerHTML).to.be.equal('<template></template>');
		});

		it('should include template', () => {
			createTemplate(parent, '<template id="tmpl">world</template><div>hello <content selector="#tmpl"></content>!</div>');

			expect(parent.innerHTML).to.be.equal(
				'<template id="tmpl"></template><div>hello world<!--' + ComponentCompiler.PLACEHOLDER_COMMENT + '-->!</div>'
			);
		});

		it('should include template with custom imports', () => {
			let scope = {
				prefix: 'a-',
				postfix: '-a',
			};

			createTemplate(
				parent,
				'<template id="tmpl">{{ id + "/" + title + postfix + (!last ? ", ": "") }}</template>' +
				'<content selector="#tmpl" [import]="{id: 1, title: prefix + \'first\', last: false}"></content>' +
				'<content selector="#tmpl" [import]="{id: 2, title: prefix + \'second\', last: false}"></content>' +
				'<content selector="#tmpl" [import]="{id: 3, title: prefix + \'third\', last: true}"></content>',
				scope
			);

			let comment = '<!--' + ComponentCompiler.PLACEHOLDER_COMMENT + '-->';

			expect(parent.innerHTML).to.be.equal('<template id="tmpl"></template>1/a-first-a, ' + comment + '2/a-second-a, ' + comment + '3/a-third-a' + comment);
		});

	});

});
