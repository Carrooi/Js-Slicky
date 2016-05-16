import {TextParser} from '../../../../src/Templating/Parsers/TextParser';

import chai = require('chai');


let expect = chai.expect;


/**
 * @see https://github.com/mikeric/rivets/blob/094572cbeb1dacfb5dabfc850dddb357adaa8f86/spec/rivets/text_template_parser.js
 */
describe('#Templating/Parsers/TextParser', () => {

	describe('parse()', () => {

		it('tokenizes a text template', () => {
			let template = 'Hello {{ user.name }}, you have {{ user.messages.unread | length }} unread messages.';
			let expected = [
				{type: TextParser.TYPE_TEXT, value: 'Hello '},
				{type: TextParser.TYPE_BINDING, value: 'user.name'},
				{type: TextParser.TYPE_TEXT, value: ', you have '},
				{type: TextParser.TYPE_BINDING, value: 'user.messages.unread | length'},
				{type: TextParser.TYPE_TEXT, value: ' unread messages.'},
			];

			let results = TextParser.parse(template);

			expect(results).to.have.length(5);

			for (let i = 0; i < results.length; i++) {
				expect(results[i].type).to.be.equal(expected[i].type);
				expect(results[i].value).to.be.equal(expected[i].value);
			}
		});

		it('should return a single text token when without any binding fragments', () => {
			let template = 'Hello World!';
			let expected = [{type: TextParser.TYPE_TEXT, value: 'Hello World!'}];

			let results = TextParser.parse(template);

			expect(results).to.have.length(1);

			for (let i = 0; i < results.length; i++) {
				expect(results[i].type).to.be.equal(expected[i].type);
				expect(results[i].value).to.be.equal(expected[i].value);
			}
		});

		it('should return a single binding token when with only one binding fragment', () => {
			let template = '{{ user.name }}';
			let expected = [{type: TextParser.TYPE_BINDING, value: 'user.name'}];

			let results = TextParser.parse(template);

			expect(results).to.have.length(1);

			for (let i = 0; i < results.length; i++) {
				expect(results[i].type).to.be.equal(expected[i].type);
				expect(results[i].value).to.be.equal(expected[i].value);
			}
		});

	});

});
