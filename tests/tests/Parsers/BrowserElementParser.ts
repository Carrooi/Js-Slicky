import {BrowserElementParser} from '../../../src/Parsers/BrowserElementParser';
import {HTMLAttributeType, HTMLTokenType, ElementToken} from '../../../src/Parsers/AbstractHTMLParser';

import chai = require('chai');


let expect = chai.expect;


let parse = (html: string): ElementToken => {
	let parent = document.createElement('div');
	parent.innerHTML = html;

	return (new BrowserElementParser).parse(parent.children[0]);
};


describe('#Parsers/BrowserElementParser', () => {

	describe('parse()', () => {

		it('should throw an error when parsing template element', () => {
			expect(() => {
				parse('<template></template>');
			}).to.throw(Error, 'BrowserElementParser: can not parse template element.');
		});

		it('should throw an error when parsing template shortcut attributes', () => {
			expect(() => {
				parse('<div *s:for></div>');
			}).to.throw(Error, 'BrowserElementParser: can not parse template shortcut attribute "s:for".');
		});

		it('should parse element', () => {
			expect(parse('<div></div>')).to.be.eql({
				type: HTMLTokenType.T_ELEMENT,
				name: 'div',
				attributes: {},
				parent: null,
				children: [],
			});
		});

		it('should parse element with attributes', () => {
			expect(parse('<div hidden class="alert" id=\'div\' [data]=data #div (click)="click()"></div>')).to.be.eql({
				type: HTMLTokenType.T_ELEMENT,
				name: 'div',
				attributes: {
					hidden: {
						type: HTMLAttributeType.NATIVE,
						name: 'hidden',
						originalName: 'hidden',
						value: '',
					},
					'class': {
						type: HTMLAttributeType.NATIVE,
						name: 'class',
						originalName: 'class',
						value: 'alert',
					},
					id: {
						type: HTMLAttributeType.NATIVE,
						name: 'id',
						originalName: 'id',
						value: 'div',
					},
					data: {
						type: HTMLAttributeType.PROPERTY,
						name: 'data',
						originalName: 'data',
						value: 'data',
					},
					div: {
						type: HTMLAttributeType.EXPORT,
						name: 'div',
						originalName: 'div',
						value: '',
					},
					click: {
						type: HTMLAttributeType.EVENT,
						name: 'click',
						originalName: 'click',
						preventDefault: false,
						value: 'click()',
					},
				},
				parent: null,
				children: [],
			});
		});

		it('should convert attributes with hyphens to camel cased names', () => {
			expect(parse('<div data-attr="data"></div>')).to.be.eql({
				type: HTMLTokenType.T_ELEMENT,
				name: 'div',
				attributes: {
					dataAttr: {
						type: HTMLAttributeType.NATIVE,
						name: 'dataAttr',
						originalName: 'data-attr',
						value: 'data',
					},
				},
				parent: null,
				children: [],
			});
		});

		it('should parse element with single expression in attribute', () => {
			expect(parse('<div class="{{ type }}"></div>')).to.be.eql({
				type: HTMLTokenType.T_ELEMENT,
				name: 'div',
				attributes: {
					'class': {
						type: HTMLAttributeType.EXPRESSION,
						name: 'class',
						originalName: 'class',
						value: 'type',
					},
				},
				parent: null,
				children: [],
			});
		});

		it('should parse element with expression in attribute', () => {
			expect(parse('<div class="alert alert-{{ type }}"></div>')).to.be.eql({
				type: HTMLTokenType.T_ELEMENT,
				name: 'div',
				attributes: {
					'class': {
						type: HTMLAttributeType.EXPRESSION,
						name: 'class',
						originalName: 'class',
						value: '"alert alert-"+(type)',
					},
				},
				parent: null,
				children: [],
			});
		});

		it('should expand events', () => {
			expect(parse('<input (keydown|keypress)="press()">')).to.be.eql({
				type: HTMLTokenType.T_ELEMENT,
				name: 'input',
				attributes: {
					keydown: {
						name: 'keydown',
						originalName: 'keydown',
						type: HTMLAttributeType.EVENT,
						preventDefault: false,
						value: 'press()',
					},
					keypress: {
						name: 'keypress',
						originalName: 'keypress',
						type: HTMLAttributeType.EVENT,
						preventDefault: false,
						value: 'press()',
					},
				},
				parent: null,
				children: [],
			});
		});

		it('should parse events with preventDefault option', () => {
			expect(parse('<input (keydown|keypress)!="press()">')).to.be.eql({
				type: HTMLTokenType.T_ELEMENT,
				name: 'input',
				attributes: {
					keydown: {
						name: 'keydown',
						originalName: 'keydown',
						type: HTMLAttributeType.EVENT,
						preventDefault: true,
						value: 'press()',
					},
					keypress: {
						name: 'keypress',
						originalName: 'keypress',
						type: HTMLAttributeType.EVENT,
						preventDefault: true,
						value: 'press()',
					},
				},
				parent: null,
				children: [],
			});
		});

		it('should parse two way data binding', () => {
			expect(parse('<div [(article-title)]="title"></div>')).to.be.eql({
				type: HTMLTokenType.T_ELEMENT,
				name: 'div',
				attributes: {
					articleTitle: {
						name: 'articleTitle',
						originalName: 'article-title',
						type: HTMLAttributeType.PROPERTY,
						value: 'title',
					},
					articleTitleChange: {
						name: 'articleTitleChange',
						originalName: 'article-title-change',
						preventDefault: true,
						type: HTMLAttributeType.EVENT,
						value: 'title=$value',
					},
				},
				parent: null,
				children: [],
			});
		});

	});

});
