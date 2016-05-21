import {ForParser} from '../../../src/Parsers/ForParser';

import chai = require('chai');


let expect = chai.expect;


describe('#Parsers/ForParser', () => {

	describe('parse()', () => {

		it('should parse array for loop without key', () => {
			let result = ForParser.parse('user in users');

			expect(result).to.be.eql({
				code: 'user in users',
				key: null,
				value: {code: 'user', name: 'user', exportable: false, path: []},
				obj: {code: 'users', name: 'users', exportable: false, path: []},
				type: ForParser.TYPE_ARRAY,
			});
		});

		it('should parse array for loop with key and exportable value', () => {
			let result = ForParser.parse('i, #user in users');

			expect(result).to.be.eql({
				code: 'i, #user in users',
				key: {code: 'i', name: 'i', exportable: false, path: []},
				value: {code: '#user', name: 'user', exportable: true, path: []},
				obj: {code: 'users', name: 'users', exportable: false, path: []},
				type: ForParser.TYPE_ARRAY,
			});
		});

		it('should parse object for loop without key', () => {
			let result = ForParser.parse('option of options');

			expect(result).to.be.eql({
				code: 'option of options',
				key: null,
				value: {code: 'option', name: 'option', exportable: false, path: []},
				obj: {code: 'options', name: 'options', exportable: false, path: []},
				type: ForParser.TYPE_OBJECT,
			});
		});

		it('should parse object for loop with key and exportable value', () => {
			let result = ForParser.parse('key, #option of options');

			expect(result).to.be.eql({
				code: 'key, #option of options',
				key: {code: 'key', name: 'key', exportable: false, path: []},
				value: {code: '#option', name: 'option', exportable: true, path: []},
				obj: {code: 'options', name: 'options', exportable: false, path: []},
				type: ForParser.TYPE_OBJECT,
			});
		});

	});

});
