import {HTMLParser, HTMLTokenType, HTMLAttributeType, StringToken, ElementToken} from '../../../src/Parsers/HTMLParser';
import {ExpressionDependencyType} from '../../../src/constants';

import chai = require('chai');


let expect = chai.expect;


let parse = (html: string): Array<StringToken|ElementToken> => {
	function process(branch: Array<StringToken|ElementToken>) {
		for (let i = 0; i < branch.length; i++) {
			let node = branch[i];

			if (node.parent) {
				node.parent = {
					type: node.parent.type,
					name: node.parent.name,
					attributes: node.parent.attributes,
					parent: node.parent.parent,
					children: [],
				};
			}

			if (node['children'] && node['children'].length) {
				node['children'] = process(node['children']);
			}
		}

		return branch;
	}

	return process(HTMLParser.parse(html));
};


describe('#Tokenizer/HTMLParser', () => {

	describe('parse()', () => {

		it('should parse text', () => {
			expect(parse('lorem ipsum')).to.be.eql([
				{
					type: HTMLTokenType.T_STRING,
					value: 'lorem ipsum',
					parent: null,
				},
			]);
		});

		it('should parse text with expressions', () => {
			expect(parse('hello {{ name }}!!!')).to.be.eql([
				{
					type: HTMLTokenType.T_STRING,
					value: 'hello ',
					parent: null,
				},
				{
					type: HTMLTokenType.T_EXPRESSION,
					parent: null,
					expression: {
						code: 'name',
						dependencies: [
							{
								code: 'name',
								type: ExpressionDependencyType.Object,
								root: 'name',
							},
						],
						filters: [],
					},
				},
				{
					type: HTMLTokenType.T_STRING,
					value: '!!!',
					parent: null,
				},
			]);
		});

		it('should parse element', () => {
			expect(parse('<div></div>')).to.be.eql([
				{
					type: HTMLTokenType.T_ELEMENT,
					name: 'div',
					attributes: {},
					parent: null,
					children: [],
				},
			]);
		});

		it('should parse inner elements', () => {
			expect(parse('<div><span><i><small>hello</small></i></span></div>')).to.be.eql([
				{
					type: HTMLTokenType.T_ELEMENT,
					name: 'div',
					attributes: {},
					parent: null,
					children: [
						{
							type: HTMLTokenType.T_ELEMENT,
							name: 'span',
							attributes: {},
							parent: {
								type: HTMLTokenType.T_ELEMENT,
								name: 'div',
								attributes: {},
								parent: null,
								children: [],
							},
							children: [
								{
									type: HTMLTokenType.T_ELEMENT,
									name: 'i',
									attributes: {},
									parent: {
										type: HTMLTokenType.T_ELEMENT,
										name: 'span',
										attributes: {},
										parent: {
											type: HTMLTokenType.T_ELEMENT,
											name: 'div',
											attributes: {},
											parent: null,
											children: [],
										},
										children: [],
									},
									children: [
										{
											type: HTMLTokenType.T_ELEMENT,
											name: 'small',
											attributes: {},
											parent: {
												type: HTMLTokenType.T_ELEMENT,
												name: 'i',
												attributes: {},
												parent: {
													type: HTMLTokenType.T_ELEMENT,
													name: 'span',
													attributes: {},
													parent: {
														type: HTMLTokenType.T_ELEMENT,
														name: 'div',
														attributes: {},
														parent: null,
														children: [],
													},
													children: [],
												},
												children: [],
											},
											children: [
												{
													type: HTMLTokenType.T_STRING,
													value: 'hello',
													parent: {
														type: HTMLTokenType.T_ELEMENT,
														name: 'small',
														attributes: {},
														parent: {
															type: HTMLTokenType.T_ELEMENT,
															name: 'i',
															attributes: {},
															parent: {
																type: HTMLTokenType.T_ELEMENT,
																name: 'span',
																attributes: {},
																parent: {
																	type: HTMLTokenType.T_ELEMENT,
																	name: 'div',
																	attributes: {},
																	parent: null,
																	children: [],
																},
																children: [],
															},
															children: [],
														},
														children: [],
													},
												},
											],
										},
									],
								},
							],
						},
					],
				},
			]);
		});

		it('should parse element with attributes', () => {
			expect(parse('<div hidden class="alert" id=\'div\' [data]=data #div (click)="click()"></div>')).to.be.eql([
				{
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
							value: {
								code: 'data',
								dependencies: [
									{
										code: 'data',
										type: ExpressionDependencyType.Object,
										root: 'data',
									},
								],
								filters: [],
							},
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
							value: {
								code: 'click()',
								dependencies: [
									{
										code: 'click()',
										type: ExpressionDependencyType.Call,
										root: 'click',
									},
								],
								filters: [],
							},
						},
					},
					parent: null,
					children: [],
				},
			]);
		});

		it('should convert attributes with hyphens to camel cased names', () => {
			expect(parse('<div data-attr="data"></div>')).to.be.eql([
				{
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
				},
			]);
		});

		it('should parse element with single expression in attribute', () => {
			console.log(parse('<div class="{{ type }}"></div>'));
			expect(parse('<div class="{{ type }}"></div>')).to.be.eql([
				{
					type: HTMLTokenType.T_ELEMENT,
					name: 'div',
					attributes: {
						'class': {
							type: HTMLAttributeType.EXPRESSION,
							name: 'class',
							originalName: 'class',
							value: {
								code: 'type',
								dependencies: [
									{
										code: 'type',
										type: ExpressionDependencyType.Object,
										root: 'type',
									},
								],
								filters: [],
							},
						},
					},
					parent: null,
					children: [],
				},
			]);
		});

		it('should parse element with expression in attribute', () => {
			expect(parse('<div class="alert alert-{{ type }}"></div>')).to.be.eql([
				{
					type: HTMLTokenType.T_ELEMENT,
					name: 'div',
					attributes: {
						'class': {
							type: HTMLAttributeType.EXPRESSION,
							name: 'class',
							originalName: 'class',
							value: {
								code: '"alert alert-"+(type)',
								dependencies: [
									{
										code: 'type',
										type: ExpressionDependencyType.Object,
										root: 'type',
									},
								],
								filters: [],
							},
						},
					},
					parent: null,
					children: [],
				},
			]);
		});

		it('should expand template from attribute', () => {
			expect(parse('<div *if="true" *for="false" class="alert">hello world</div>')).to.be.eql([
				{
					type: HTMLTokenType.T_ELEMENT,
					name: 'template',
					attributes: {
						'if': {
							type: HTMLAttributeType.PROPERTY,
							name: 'if',
							originalName: 'if',
							value: {
								code: 'true',
								dependencies: [],
								filters: [],
							},
						},
					},
					parent: null,
					children: [
						{
							type: HTMLTokenType.T_ELEMENT,
							name: 'template',
							attributes: {
								'for': {
									type: HTMLAttributeType.PROPERTY,
									name: 'for',
									originalName: 'for',
									value: {
										code: 'false',
										dependencies: [],
										filters: [],
									},
								},
							},
							parent: null,
							children: [
								{
									type: HTMLTokenType.T_ELEMENT,
									name: 'div',
									attributes: {
										'class': {
											type: HTMLAttributeType.NATIVE,
											name: 'class',
											originalName: 'class',
											value: 'alert',
										},
									},
									parent: null,
									children: [
										{
											type: HTMLTokenType.T_STRING,
											value: 'hello world',
											parent: {
												type: HTMLTokenType.T_ELEMENT,
												name: 'div',
												attributes: {
													'class': {
														type: HTMLAttributeType.NATIVE,
														name: 'class',
														originalName: 'class',
														value: 'alert',
													},
												},
												parent: null,
												children: [],
											},
										},
									],
								},
							],
						},
					],
				},
			]);
		});

		it('should expand whole s:for template', () => {
			expect(parse('<div *s:for="#item of items; trackBy trackByFn; #i = index"></div>')).to.be.eql([
				{
					type: HTMLTokenType.T_ELEMENT,
					name: 'template',
					attributes: {
						's:for': {
							type: HTMLAttributeType.PROPERTY,
							name: 's:for',
							originalName: 's:for',
							value: {
								code: '',
								dependencies: [],
								filters: [],
							},
						},
						item: {
							type: HTMLAttributeType.EXPORT,
							name: 'item',
							originalName: 'item',
							value: '',
						},
						's:forOf': {
							type: HTMLAttributeType.PROPERTY,
							name: 's:forOf',
							originalName: 's:forOf',
							value: {
								code: 'items',
								dependencies: [
									{
										code: 'items',
										type: ExpressionDependencyType.Object,
										root: 'items',
									},
								],
								filters: [],
							},
						},
						's:forTrackBy': {
							type: HTMLAttributeType.PROPERTY,
							name: 's:forTrackBy',
							originalName: 's:forTrackBy',
							value: {
								code: 'trackByFn',
								dependencies: [
									{
										code: 'trackByFn',
										type: ExpressionDependencyType.Object,
										root: 'trackByFn',
									},
								],
								filters: [],
							},
						},
						i: {
							type: HTMLAttributeType.EXPORT,
							name: 'i',
							originalName: 'i',
							value: 'index',
						},
					},
					parent: null,
					children: [
						{
							type: HTMLTokenType.T_ELEMENT,
							name: 'div',
							attributes: {},
							parent: null,
							children: [],
						},
					],
				},
			]);
		});

		it('should parse text expression with filters', () => {
			expect(parse('{{ name | lower | truncate : 33 : "..." }}')).to.be.eql([
				{
					type: HTMLTokenType.T_EXPRESSION,
					expression: {
						code: 'name',
						dependencies: [
							{
								code: 'name',
								type: ExpressionDependencyType.Object,
								root: 'name',
							},
						],
						filters: [
							{
								name: 'lower',
								arguments: [],
							},
							{
								name: 'truncate',
								arguments: [
									{
										code: '33',
										dependencies: [],
										filters: [],
									},
									{
										code: '"..."',
										dependencies: [],
										filters: [],
									},
								],
							},
						],
					},
					parent: null,
				},
			]);
		});

		it('should correctly parse template element', () => {
			expect(parse('<div><template><span><i>hello</i></span></template></div>')).to.be.eql([
				{
					type: HTMLTokenType.T_ELEMENT,
					name: 'div',
					attributes: {},
					parent: null,
					children: [
						{
							type: HTMLTokenType.T_ELEMENT,
							name: 'template',
							attributes: {},
							parent: {
								type: HTMLTokenType.T_ELEMENT,
								name: 'div',
								attributes: {},
								parent: null,
								children: [],
							},
							children: [
								{
									type: HTMLTokenType.T_ELEMENT,
									name: 'span',
									attributes: {},
									parent: null,
									children: [
										{
											type: HTMLTokenType.T_ELEMENT,
											name: 'i',
											attributes: {},
											parent: {
												type: HTMLTokenType.T_ELEMENT,
												name: 'span',
												attributes: {},
												parent: null,
												children: [],
											},
											children: [
												{
													type: HTMLTokenType.T_STRING,
													value: 'hello',
													parent: {
														type: HTMLTokenType.T_ELEMENT,
														name: 'i',
														attributes: {},
														parent: {
															type: HTMLTokenType.T_ELEMENT,
															name: 'span',
															attributes: {},
															parent: null,
															children: [],
														},
														children: [],
													},
												},
											],
										},
									],
								},
							],
						},
					],
				}
			]);
		});

		it('should parse multi-line element', () => {
			expect(parse('<div\nid="some-id"\n></div>')).to.be.eql([
				{
					type: HTMLTokenType.T_ELEMENT,
					name: 'div',
					attributes: {
						id: {
							name: 'id',
							originalName: 'id',
							type: HTMLAttributeType.NATIVE,
							value: 'some-id',
						},
					},
					parent: null,
					children: [],
				},
			]);
		});

		it('should expand events', () => {
			expect(parse('<input (keydown|keypress)="press()">')).to.be.eql([
				{
					type: HTMLTokenType.T_ELEMENT,
					name: 'input',
					attributes: {
						keydown: {
							name: 'keydown',
							originalName: 'keydown',
							type: HTMLAttributeType.EVENT,
							preventDefault: false,
							value: {
								code: 'press()',
								dependencies: [
									{
										code: 'press()',
										type: ExpressionDependencyType.Call,
										root: 'press',
									},
								],
								filters: [],
							},
						},
						keypress: {
							name: 'keypress',
							originalName: 'keypress',
							type: HTMLAttributeType.EVENT,
							preventDefault: false,
							value: {
								code: 'press()',
								dependencies: [
									{
										code: 'press()',
										type: ExpressionDependencyType.Call,
										root: 'press',
									},
								],
								filters: [],
							},
						},
					},
					parent: null,
					children: [],
				},
			]);
		});

		it('should parse events with preventDefault option', () => {
			expect(parse('<input (keydown|keypress)!="press()">')).to.be.eql([
				{
					type: HTMLTokenType.T_ELEMENT,
					name: 'input',
					attributes: {
						keydown: {
							name: 'keydown',
							originalName: 'keydown',
							type: HTMLAttributeType.EVENT,
							preventDefault: true,
							value: {
								code: 'press()',
								dependencies: [
									{
										code: 'press()',
										type: ExpressionDependencyType.Call,
										root: 'press',
									},
								],
								filters: [],
							},
						},
						keypress: {
							name: 'keypress',
							originalName: 'keypress',
							type: HTMLAttributeType.EVENT,
							preventDefault: true,
							value: {
								code: 'press()',
								dependencies: [
									{
										code: 'press()',
										type: ExpressionDependencyType.Call,
										root: 'press',
									},
								],
								filters: [],
							},
						},
					},
					parent: null,
					children: [],
				},
			]);
		});

		it('should parse two way data binding', () => {
			expect(parse('<div [(article-title)]="title"></div>')).to.be.eql([
				{
					type: HTMLTokenType.T_ELEMENT,
					name: 'div',
					attributes: {
						articleTitle: {
							name: 'articleTitle',
							originalName: 'article-title',
							type: HTMLAttributeType.PROPERTY,
							value: {
								code: 'title',
								dependencies: [
									{
										code: 'title',
										type: ExpressionDependencyType.Object,
										root: 'title',
									},
								],
								filters: [],
							},
						},
						articleTitleChange: {
							name: 'articleTitleChange',
							originalName: 'article-title-change',
							preventDefault: true,
							type: HTMLAttributeType.EVENT,
							value: {
								code: 'title=$value',
								dependencies: [
									{
										code: 'title',
										type: ExpressionDependencyType.Object,
										root: 'title',
									},
									{
										code: '$value',
										type: ExpressionDependencyType.Object,
										root: '$value',
									},
								],
								filters: [],
							},
						},
					},
					parent: null,
					children: [],
				},
			]);
		});

	});

});
