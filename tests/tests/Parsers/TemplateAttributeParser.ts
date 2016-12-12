import {TemplateAttributeParser} from '../../../src/Parsers/TemplateAttributeParser';

import chai = require('chai');


let expect = chai.expect;


describe('#Parsers/TemplateAttributeParser', () => {

	describe('parse()', () => {

		it('should parse template attributes', () => {
			expect(TemplateAttributeParser.parse('*s:for', '#hero of heroes; trackBy trackByHeroes; sortBy sortByString(\'name\')')).to.be.eql([
				{
					name: '[s:for]',
					value: '',
				},
				{
					name: '#hero',
					value: '',
				},
				{
					name: '[s:forOf]',
					value: 'heroes',
				},
				{
					name: '[s:forTrackBy]',
					value: 'trackByHeroes',
				},
				{
					name: '[s:forSortBy]',
					value: "sortByString('name')",
				},
			]);
		});

		it('should parse template attributes with filters', () => {
			expect(TemplateAttributeParser.parse('*s:for', '#hero of heroes | filter : "name" | sort')).to.be.eql([
				{
					name: '[s:for]',
					value: '',
				},
				{
					name: '#hero',
					value: '',
				},
				{
					name: '[s:forOf]',
					value: 'heroes | filter : "name" | sort',
				},
			]);
		});

		it('should parse template with advanced expressions', () => {
			expect(TemplateAttributeParser.parse('*s:a', 'one; two (a - b; 5); three')).to.be.eql([
				{
					name: '[s:a]',
					value: 'one',
				},
				{
					name: '[s:aTwo]',
					value: '(a - b; 5)',
				},
				{
					name: '[s:aThree]',
					value: '',
				},
			]);
		});

		it('should parse template with simple code', () => {
			expect(TemplateAttributeParser.parse('*s:a', 'app.isAllowed() && true')).to.be.eql([
				{
					name: '[s:a]',
					value: 'app.isAllowed() && true',
				},
			]);
		});

		it('should parse template with exportable variables', () => {
			expect(TemplateAttributeParser.parse('*s:a', '#a = a; #b; #c=c')).to.be.eql([
				{
					name: '[s:a]',
					value: '',
				},
				{
					name: '#a',
					value: 'a',
				},
				{
					name: '#b',
					value: '',
				},
				{
					name: '#c',
					value: 'c',
				},
			]);
		});

	});

});
