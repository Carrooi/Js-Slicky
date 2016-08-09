import {Code} from '../../../src/Util/Code';
import {VariableParser} from '../../../src/Parsers/VariableParser';
import {VariableToken} from '../../../src/Interfaces';

import chai = require('chai');


let expect = chai.expect;


describe('#Util/Code', () => {

	describe('exportVariablesUsages()', () => {

		it('should return all used variables', () => {
			let result = Code.exportVariablesUsages('var #result = $a.q.w + b[0].g + #c + d["H"]; [3]; return result; alert("hello"); alert(5);');

			expect(result).to.be.eql(['#result', '$a.q.w', 'b[0].g', '#c', 'd["H"]', 'alert']);
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
