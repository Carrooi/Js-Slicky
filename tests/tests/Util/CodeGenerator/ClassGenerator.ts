import {ClassGenerator} from '../../../../src/Util/CodeGenerator/ClassGenerator';

import chai = require('chai');


let expect = chai.expect;


describe('#Util/CodeGenerator/ClassGenerator', () => {

	describe.skip('toString()', () => {

		it('should generate simple class', () => {
			let generator = new ClassGenerator('Test');
			expect(generator.toString()).to.be.equal('function Test() {}');
		});

		it('should generate class with constructor', () => {
			let generator = new ClassGenerator('Test');
			generator.setConstructor(['arg1', 'arg2', 'arg3'], 'this.arg1 = arg1; this.arg2 = arg2; this.arg3 = arg3;');
			expect(generator.toString()).to.be.equal(
				'function Test(arg1, arg2, arg3) {' +
					'this.arg1 = arg1; this.arg2 = arg2; this.arg3 = arg3;' +
				'}'
			);
		});

		it('should generate class with properties', () => {
			let generator = new ClassGenerator('Test');
			generator.addProperty('prop1', '"value"');
			generator.addProperty('prop2', '5');
			expect(generator.toString()).to.be.equal(
				'function Test() {} ' +
				'Test.prototype.prop1 = "value"; ' +
				'Test.prototype.prop2 = 5;'
			);
		});

		it('should generate class with methods', () => {
			let generator = new ClassGenerator('Test');
			generator.addMethod('method1');
			generator.addMethod('method2', ['arg']);
			generator.addMethod('method3', [], 'console.log(this);');
			expect(generator.toString()).to.be.equal(
				'function Test() {} ' +
				'Test.prototype.method1 = function() {}; ' +
				'Test.prototype.method2 = function(arg) {}; ' +
				'Test.prototype.method3 = function() {console.log(this);};'
			);
		});

	});

});
