import {ClassGenerator} from '../../../../src/Util/CodeGenerator/ClassGenerator';

import chai = require('chai');


let expect = chai.expect;


describe('#Util/CodeGenerator/ClassGenerator', () => {

	describe('toString()', () => {

		it('should generate simple class', () => {
			let generator = new ClassGenerator('Test');
			expect(generator.toString()).to.be.equal(
				'return (function() {\n' +
					'\tfunction Test() {};\n' +
					'\treturn Test;\n' +
				'})();'
			);
		});

		it('should generate class with constructor', () => {
			let generator = new ClassGenerator('Test');
			generator.setConstructor(['arg1', 'arg2', 'arg3'], 'this.arg1 = arg1; this.arg2 = arg2; this.arg3 = arg3;');
			expect(generator.toString()).to.be.equal(
				'return (function() {\n' +
					'\tfunction Test(arg1, arg2, arg3) {\n' +
						'\t\tthis.arg1 = arg1; this.arg2 = arg2; this.arg3 = arg3;\n' +
					'\t};\n' +
					'\treturn Test;\n' +
				'})();'
			);
		});

		it('should generate class with properties', () => {
			let generator = new ClassGenerator('Test');
			generator.addProperty('prop1', '"value"');
			generator.addProperty('prop2', '5');
			expect(generator.toString()).to.be.equal(
				'return (function() {\n' +
					'\tfunction Test() {};\n' +
					'\tTest.prototype.prop1 = "value";\n' +
					'\tTest.prototype.prop2 = 5;\n' +
					'\treturn Test;\n' +
				'})();'
			);
		});

		it('should generate class with methods', () => {
			let generator = new ClassGenerator('Test');
			generator.addMethod('method1');
			generator.addMethod('method2', ['arg']);
			generator.addMethod('method3', [], 'console.log(this);');
			expect(generator.toString()).to.be.equal(
				'return (function() {\n' +
					'\tfunction Test() {};\n' +
					'\tTest.prototype.method1 = function() {};\n' +
					'\tTest.prototype.method2 = function(arg) {};\n' +
					'\tTest.prototype.method3 = function() {\n' +
						'\t\tconsole.log(this);\n' +
					'\t};\n' +
					'\treturn Test;\n' +
				'})();'
			);
		});

	});

});
