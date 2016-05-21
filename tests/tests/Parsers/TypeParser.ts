import {TypeParser} from '../../../src/Parsers/TypeParser';

import chai = require('chai');


let expect = chai.expect;


describe('#Parsers/TypeParser', () => {

	describe('parse()', () => {

		it('should return correct tokens', () => {
			expect(TypeParser.parse('"test"')).to.be.eql({
				value: 'test',
				type: TypeParser.TYPE_PRIMITIVE,
			});

			expect(TypeParser.parse("'test'")).to.be.eql({
				value: 'test',
				type: TypeParser.TYPE_PRIMITIVE,
			});

			expect(TypeParser.parse('true')).to.be.eql({
				value: true,
				type: TypeParser.TYPE_PRIMITIVE,
			});

			expect(TypeParser.parse('false')).to.be.eql({
				value: false,
				type: TypeParser.TYPE_PRIMITIVE,
			});

			expect(TypeParser.parse('null')).to.be.eql({
				value: null,
				type: TypeParser.TYPE_PRIMITIVE,
			});

			expect(TypeParser.parse('undefined')).to.be.eql({
				value: undefined,
				type: TypeParser.TYPE_PRIMITIVE,
			});

			expect(TypeParser.parse('3.5')).to.be.eql({
				value: 3.5,
				type: TypeParser.TYPE_PRIMITIVE,
			});

			expect(TypeParser.parse('a + b')).to.be.eql({
				value: 'a + b',
				type: TypeParser.TYPE_EXPRESSION,
			});
		});

	});

});
