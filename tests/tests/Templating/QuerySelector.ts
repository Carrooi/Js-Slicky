import {QuerySelector} from '../../../src/Templating/QuerySelector';
import {HTMLParser, ElementToken} from '../../../src/Parsers/HTMLParser';

import chai = require('chai');


let expect = chai.expect;


let el = (html: string): ElementToken => {
	return (<Array<ElementToken>>HTMLParser.parse(html))[0];
};


let match = (selector: string, html: string, expected: boolean, extract?: string) => {
	let node = el(html);

	if (extract) {
		let path = extract.split('-');
		for (let i = 0; i < path.length; i++) {
			node = <ElementToken>node.children[parseInt(path[i])];
		}
	}

	expect(QuerySelector.match(selector, node)).to.be.equal(expected);
};


describe('#Templating/QuerySelector', () => {

	describe('match()', () => {

		it('should match simple id selector', () => {
			match('#id', '<div id="id"></div>', true);
		});

		it('should not match simple id selector', () => {
			match('#id', '<div id="not-id"></div>', false);
		});

		it('should match simple element selector', () => {
			match('div', '<div></div>', true);
		});

		it('should not match simple element selector', () => {
			match('div', '<span></span>', false);
		});

		it('should match simple class selector', () => {
			match('.class', '<div class="alert class info"></div>', true);
		});

		it('should not match simple class selector', () => {
			match('.class', '<div></div>', false);
			match('.class', '<div class="alert info"></div>', false);
		});

		it('should match simple attribute selector', () => {
			match('[title]', '<div title="title"></div>', true);
		});

		it('should not match simple attribute selector', () => {
			match('[title]', '<div></div>', false);
		});

		it('should match simple attribute selector with value', () => {
			match('[title="hello"]', '<div title="hello"></div>', true);
		});

		it('should match simple attribute selector with value', () => {
			match('[title="hello"]', '<div></div>', false);
			match('[title="hello"]', '<div title></div>', false);
			match('[title="hello"]', '<div title="lorem"></div>', false);
		});

		it('should match multi word attribute', () => {
			match('[data-title="title"]', '<div data-title="title"></div>', true);
			match('[dataTitle="title"]', '<div data-title="title"></div>', true);
		});

		it('should match nested selector', () => {
			match(
				'div#flashes ul li.flash i[close]',
				'<div><div id="flashes"><div><ul><li class="flash"><a><i close></i></a></li></ul></div></div></div>',
				true,
				'0-0-0-0-0-0'
			);

			match(
				'div#flashes ul li.flash > a > i[close]',
				'<div><div id="flashes"><div><ul><li class="flash"><a><i close></i></a></li></ul></div></div></div>',
				true,
				'0-0-0-0-0-0'
			);
		});

		it('should not match nested selector', () => {
			match(
				'div#flashes ul > li.flash small',
				'<div><div id="flashes"><div><ul><li class="flash"><a><i close></i></a></li></ul></div></div></div>',
				false,
				'0-0-0-0-0-0'
			);

			match(
				'div#alerts ul li.flash > i[close]',
				'<div><div id="flashes"><div><ul><li class="flash"><a><i close></i></a></li></ul></div></div></div>',
				false,
				'0-0-0-0-0-0'
			);

			match(
				'div#flashes .alerts ul li.flash > i[close]',
				'<div><div id="flashes"><div><ul><li class="flash"><a><i close></i></a></li></ul></div></div></div>',
				false,
				'0-0-0-0-0-0'
			);
		});

		it('should not match element by selector outside of parent boundary', () => {
			let dom = HTMLParser.parse('<div><ul><li><span><button></button></span></li></ul></div>');
			let boundary = <ElementToken>(<any>dom[0]).children[0].children[0].children[0];			// span
			let btn = <ElementToken>(<any>dom[0]).children[0].children[0].children[0].children[0];	// button

			expect(QuerySelector.match('li button', btn, boundary)).to.be.equal(false);
			expect(QuerySelector.match('span button', btn, boundary)).to.be.equal(false);
			expect(QuerySelector.match('span > button', btn, boundary)).to.be.equal(false);
		});

	});

});
