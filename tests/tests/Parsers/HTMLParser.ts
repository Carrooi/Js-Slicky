import {HTMLParser, HTMLTokenType, HTMLAttributeType, StringToken, ElementToken} from '../../../src/Parsers/HTMLParser';
import {ExpressionParserOptions} from '../../../src/Parsers/ExpressionParser';

import chai = require('chai');


let expect = chai.expect;


let parse = (html: string, options?: ExpressionParserOptions): {exports: Array<string>, tree: Array<StringToken|ElementToken>} => {
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

	if (!options) {
		options = {
			autoWrap: false,
		};
	}

	let result = (new HTMLParser(options)).parse(html);
	result.tree = process(result.tree);

	return result;
};


describe('#Tokenizer/HTMLParser', () => {

	describe('parse()', () => {

		it('should parse text', () => {
			expect(parse('lorem ipsum')).to.be.eql({
				exports: [],
				tree: [
					{
						type: HTMLTokenType.T_STRING,
						value: 'lorem ipsum',
						parent: null,
					},
				],
			});
		});

		it('should parse text with expressions', () => {
			expect(parse('hello {{ name }}!!!')).to.be.eql({
				exports: [],
				tree: [
					{
						type: HTMLTokenType.T_STRING,
						value: 'hello ',
						parent: null,
					},
					{
						type: HTMLTokenType.T_EXPRESSION,
						parent: null,
						expression: 'return name',
					},
					{
						type: HTMLTokenType.T_STRING,
						value: '!!!',
						parent: null,
					},
				],
			});
		});

		it('should parse element', () => {
			expect(parse('<div></div>')).to.be.eql({
				exports: [],
				tree: [
					{
						type: HTMLTokenType.T_ELEMENT,
						name: 'div',
						attributes: {},
						parent: null,
						children: [],
					},
				],
			});
		});

		it('should parse inner elements', () => {
			expect(parse('<div><span><i><small>hello</small></i></span></div>')).to.be.eql({
				exports: [],
				tree: [
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
				],
			});
		});

		it('should parse element with attributes', () => {
			expect(parse('<div hidden class="alert" id=\'div\' [data]=data #div (click)="click()"></div>')).to.be.eql({
				exports: [
					'div',
				],
				tree: [
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
								value: 'data',
								expression: 'return data',
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
								expression: 'return click()',
							},
						},
						parent: null,
						children: [],
					},
				],
			});
		});

		it('should convert attributes with hyphens to camel cased names', () => {
			expect(parse('<div data-attr="data"></div>')).to.be.eql({
				exports: [],
				tree: [
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
				],
			});
		});

		it('should parse element with single expression in attribute', () => {
			expect(parse('<div class="{{ type }}"></div>')).to.be.eql({
				exports: [],
				tree: [
					{
						type: HTMLTokenType.T_ELEMENT,
						name: 'div',
						attributes: {
							'class': {
								type: HTMLAttributeType.EXPRESSION,
								name: 'class',
								originalName: 'class',
								value: 'type',
								expression: 'return type',
							},
						},
						parent: null,
						children: [],
					},
				],
			});
		});

		it('should parse element with expression in attribute', () => {
			expect(parse('<div class="alert alert-{{ type }}"></div>')).to.be.eql({
				exports: [],
				tree: [
					{
						type: HTMLTokenType.T_ELEMENT,
						name: 'div',
						attributes: {
							'class': {
								type: HTMLAttributeType.EXPRESSION,
								name: 'class',
								originalName: 'class',
								value: '"alert alert-"+(type)',
								expression: 'return "alert alert-"+(type)',
							},
						},
						parent: null,
						children: [],
					},
				],
			});
		});

		it('should expand template from attribute', () => {
			expect(parse('<div *if="true" *for="false" class="alert">hello world</div>')).to.be.eql({
				exports: [],
				tree: [
					{
						type: HTMLTokenType.T_ELEMENT,
						name: 'template',
						attributes: {
							'if': {
								type: HTMLAttributeType.PROPERTY,
								name: 'if',
								originalName: 'if',
								value: 'true',
								expression: 'return true',
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
										value: 'false',
										expression: 'return false',
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
				],
			});
		});

		it('should expand whole s:for template', () => {
			expect(parse('<div *s:for="#item of items; trackBy trackByFn; #i = index"></div>')).to.be.eql({
				exports: [
					'item',
					'i',
				],
				tree: [
					{
						type: HTMLTokenType.T_ELEMENT,
						name: 'template',
						attributes: {
							's:for': {
								type: HTMLAttributeType.PROPERTY,
								name: 's:for',
								originalName: 's:for',
								value: '',
								expression: 'return undefined',
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
								value: 'items',
								expression: 'return items',
							},
							's:forTrackBy': {
								type: HTMLAttributeType.PROPERTY,
								name: 's:forTrackBy',
								originalName: 's:forTrackBy',
								value: 'trackByFn',
								expression: 'return trackByFn',
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
				],
			});
		});

		it('should load all exports', () => {
			expect(parse('<div #d><span #span-directive="directive"><i #i></i></span></div>')).to.be.eql({
				exports: [
					'd',
					'spanDirective',
					'i',
				],
				tree: [
					{
						type: HTMLTokenType.T_ELEMENT,
						name: 'div',
						attributes: {
							d: {
								type: HTMLAttributeType.EXPORT,
								name: 'd',
								originalName: 'd',
								value: '',
							},
						},
						parent: null,
						children: [
							{
								type: HTMLTokenType.T_ELEMENT,
								name: 'span',
								attributes: {
									spanDirective: {
										type: HTMLAttributeType.EXPORT,
										name: 'spanDirective',
										originalName: 'span-directive',
										value: 'directive',
									},
								},
								parent: {
									type: HTMLTokenType.T_ELEMENT,
									name: 'div',
									attributes: {
										d: {
											type: HTMLAttributeType.EXPORT,
											name: 'd',
											originalName: 'd',
											value: '',
										},
									},
									parent: null,
									children: [],
								},
								children: [
									{
										type: HTMLTokenType.T_ELEMENT,
										name: 'i',
										attributes: {
											i: {
												type: HTMLAttributeType.EXPORT,
												name: 'i',
												originalName: 'i',
												value: '',
											},
										},
										parent: {
											type: HTMLTokenType.T_ELEMENT,
											name: 'span',
											attributes: {
												spanDirective: {
													type: HTMLAttributeType.EXPORT,
													name: 'spanDirective',
													originalName: 'span-directive',
													value: 'directive',
												},
											},
											parent: {
												type: HTMLTokenType.T_ELEMENT,
												name: 'div',
												attributes: {
													d: {
														type: HTMLAttributeType.EXPORT,
														name: 'd',
														originalName: 'd',
														value: '',
													},
												},
												parent: null,
												children: [],
											},
											children: [],
										},
										children: [],
									},
								],
							},
						],
					},
				],
			});
		});

		it('should parse text expression with filters', () => {
			let html = parse('{{ name | lower | truncate : 33 : "..." }}', {
				filterProvider: 'filter(%value, "%filter", [%args])',
				autoWrap: false,
			});

			expect(html).to.be.eql({
				exports: [],
				tree: [
					{
						type: HTMLTokenType.T_EXPRESSION,
						expression: 'return filter(filter(name, "lower", []), "truncate", [33, "..."])',
						parent: null,
					},
				],
			});
		});

		it('should correctly parse template element', () => {
			expect(parse('<div><template><span><i>hello</i></span></template></div>')).to.be.eql({
				exports: [],
				tree: [
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
				],
			});
		});

		it('should parse multi-line element', () => {
			expect(parse('<div\nid="some-id"\n></div>')).to.be.eql({
				exports: [],
				tree: [
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
				],
			});
		});

		it('should expand events', () => {
			expect(parse('<input (keydown|keypress)="press()">')).to.be.eql({
				exports: [],
				tree: [
					{
						type: HTMLTokenType.T_ELEMENT,
						name: 'input',
						attributes: {
							keydown: {
								name: 'keydown',
								originalName: 'keydown',
								type: HTMLAttributeType.EVENT,
								preventDefault: false,
								value: 'press()',
								expression: 'return press()',
							},
							keypress: {
								name: 'keypress',
								originalName: 'keypress',
								type: HTMLAttributeType.EVENT,
								preventDefault: false,
								value: 'press()',
								expression: 'return press()',
							},
						},
						parent: null,
						children: [],
					},
				],
			});
		});

		it('should parse events with preventDefault option', () => {
			expect(parse('<input (keydown|keypress)!="press()">')).to.be.eql({
				exports: [],
				tree: [
					{
						type: HTMLTokenType.T_ELEMENT,
						name: 'input',
						attributes: {
							keydown: {
								name: 'keydown',
								originalName: 'keydown',
								type: HTMLAttributeType.EVENT,
								preventDefault: true,
								value: 'press()',
								expression: 'return press()',
							},
							keypress: {
								name: 'keypress',
								originalName: 'keypress',
								type: HTMLAttributeType.EVENT,
								preventDefault: true,
								value: 'press()',
								expression: 'return press()',
							},
						},
						parent: null,
						children: [],
					},
				],
			});
		});

		it('should parse two way data binding', () => {
			expect(parse('<div [(article-title)]="title"></div>')).to.be.eql({
				exports: [],
				tree: [
					{
						type: HTMLTokenType.T_ELEMENT,
						name: 'div',
						attributes: {
							articleTitle: {
								name: 'articleTitle',
								originalName: 'article-title',
								type: HTMLAttributeType.PROPERTY,
								value: 'title',
								expression: 'return title',
							},
							articleTitleChange: {
								name: 'articleTitleChange',
								originalName: 'article-title-change',
								preventDefault: true,
								type: HTMLAttributeType.EVENT,
								value: 'title=$value',
								expression: 'return title=$value',
							},
						},
						parent: null,
						children: [],
					},
				],
			});
		});

	});

});
