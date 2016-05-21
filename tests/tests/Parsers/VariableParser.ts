import {VariableParser} from '../../../src/Parsers/VariableParser';

import chai = require('chai');


let expect = chai.expect;


describe('#Parsers/VariableParser', () => {

	describe('parse()', () => {

		it('should tokenize variable path', () => {
			let result = VariableParser.parse('a[0].b');

			expect(result).to.be.eql({
				code: 'a[0].b',
				name: 'a',
				exportable: false,
				path: [
					{value: 0, type: VariableParser.PATH_TYPE_ARRAY},
					{value: 'b', type: VariableParser.PATH_TYPE_OBJECT},
				],
			});
		});

		it('should mark exportable variable', () => {
			let result = VariableParser.parse('#a[0].b');

			expect(result).to.be.eql({
				code: '#a[0].b',
				name: 'a',
				exportable: true,
				path: [
					{value: 0, type: VariableParser.PATH_TYPE_ARRAY},
					{value: 'b', type: VariableParser.PATH_TYPE_OBJECT},
				],
			});
		});

	});

});
