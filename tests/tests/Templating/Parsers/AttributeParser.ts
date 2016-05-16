import {AttributeParser} from '../../../../src/Templating/Parsers/AttributeParser';

import chai = require('chai');


let expect = chai.expect;


describe('#Templating/Parsers/TextParser', () => {

	describe('parse()', () => {

		it('should parse simple textual attribute', () => {
			expect(AttributeParser.parse('text')).to.be.equal("'text'");
		});

		it('should parse attribute with single expression', () => {
			expect(AttributeParser.parse('{{ a }}')).to.be.equal('a');
		});

		it('should parse attribute with mixed values', () => {
			let test = 'name: {{ name }}, color: {{ color }}, day: {{ day }}';
			let result = "'name: '+(name)+', color: '+(color)+', day: '+(day)";

			expect(AttributeParser.parse(test)).to.be.equal(result);
		});

	});

});
