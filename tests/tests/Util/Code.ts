import {Code} from '../../../src/Util/Code';

import chai = require('chai');


let expect = chai.expect;


describe('#Util/Code', () => {

	describe('exportVariablesUsages()', () => {

		it('should return all used variables', () => {
			let result = Code.exportVariablesUsages('var #result = $a.q.w + b[0].g + #c + d["H"]; [3]; return result; alert("hello"); alert(5);');
			expect(result).to.be.eql(['#result', '$a.q.w', 'b[0].g', '#c', 'd["H"]', 'alert']);
		});

	});

});
