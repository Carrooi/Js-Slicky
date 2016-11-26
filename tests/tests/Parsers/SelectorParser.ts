import {SelectorParser, SelectorType, ChildType} from '../../../src/Parsers/SelectorParser';

import chai = require('chai');


let expect = chai.expect;


describe('#Parser/SelectorParser', () => {

	describe('parse()', () => {

		it('should parse one element selector', () => {
			expect(SelectorParser.parse('element.class.another-class#id[hasAttribute][hasAttributeWith="value"]')).to.be.eql([
				{
					childType: ChildType.Indirect,
					selectors: [
						{
							type: SelectorType.Element,
							value: 'element',
						},
						{
							type: SelectorType.Class,
							value: 'class',
						},
						{
							type: SelectorType.Class,
							value: 'another-class',
						},
						{
							type: SelectorType.Id,
							value: 'id',
						},
						{
							type: SelectorType.Attribute,
							value: {
								name: 'hasAttribute',
								value: null,
							},
						},
						{
							type: SelectorType.Attribute,
							value: {
								name: 'hasAttributeWith',
								value: 'value',
							},
						},
					],
				},
			]);
		});

		it('should parse children selectors', () => {
			expect(SelectorParser.parse('div .alert.message > a > li [data-notify]')).to.be.eql([
				{
					childType: ChildType.Indirect,
					selectors: [
						{
							type: SelectorType.Element,
							value: 'div',
						},
					],
				},
				{
					childType: ChildType.Indirect,
					selectors: [
						{
							type: SelectorType.Class,
							value: 'alert',
						},
						{
							type: SelectorType.Class,
							value: 'message',
						},
					],
				},
				{
					childType: ChildType.Direct,
					selectors: [
						{
							type: SelectorType.Element,
							value: 'a',
						},
					],
				},
				{
					childType: ChildType.Direct,
					selectors: [
						{
							type: SelectorType.Element,
							value: 'li',
						},
					],
				},
				{
					childType: ChildType.Indirect,
					selectors: [
						{
							type: SelectorType.Attribute,
							value: {
								name: 'data-notify',
								value: null,
							},
						},
					],
				},
			]);
		});

	});

});
