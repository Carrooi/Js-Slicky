import {Code} from '../../../src/Util/Code';
import {VariableParser, VariableToken} from '../../../src/Templating/Parsers/VariableParser';

import chai = require('chai');


let expect = chai.expect;


describe('#Util/Code', () => {

	describe('exportVariablesUsages()', () => {

		it('should return all used variables', () => {
			let result = Code.exportVariablesUsages('var #result = a + b + #c + d; return result;');

			expect(result).to.be.eql(['#result', 'a', 'b', '#c', 'd']);
		});

	});

	describe('interpolateObjectElement()', () => {

		it('should interpolate simple variable', () => {
			let variable: VariableToken = {
				code: 'a',
				name: 'a',
				exportable: false,
				path: [],
			};

			let result = Code.interpolateObjectElement({a: 5}, variable);

			expect(result).to.be.eql({
				obj: {a: 5},
				key: 'a',
			});
		});

		it('should interpolate array', () => {
			let variable: VariableToken = {
				code: 'a.b[0].d[1]',
				name: 'a',
				exportable: false,
				path: [
					{value: 'b', type: VariableParser.PATH_TYPE_OBJECT},
					{value: 0, type: VariableParser.PATH_TYPE_ARRAY},
					{value: 'd', type: VariableParser.PATH_TYPE_OBJECT},
					{value: 1, type: VariableParser.PATH_TYPE_ARRAY},
				],
			};

			let result = Code.interpolateObjectElement({
				a: {
					b: [
						{
							d: [null, 5],
						},
					],
				},
			}, variable);

			expect(result).to.be.eql({
				obj: [null, 5],
				key: 1,
			});
		});

		it('should interpolate object', () => {
			let variable: VariableToken = {
				code: 'a.b[0].d',
				name: 'a',
				exportable: false,
				path: [
					{value: 'b', type: VariableParser.PATH_TYPE_OBJECT},
					{value: 0, type: VariableParser.PATH_TYPE_ARRAY},
					{value: 'd', type: VariableParser.PATH_TYPE_OBJECT},
				],
			};

			let result = Code.interpolateObjectElement({
				a: {
					b: [
						{
							d: 5,
						},
					],
				},
			}, variable);

			expect(result).to.be.eql({
				obj: {d: 5},
				key: 'd',
			});
		});

	});

});
