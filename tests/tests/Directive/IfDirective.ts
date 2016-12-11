import {OnInit, OnDestroy} from '../../../core';
import {IfDirective} from '../../../common';
import {Directive} from '../../../src/Entity/Metadata';

import {createTemplate} from '../_testHelpers';

import chai = require('chai');


let expect = chai.expect;

let parent: HTMLDivElement;


describe('#Directives/IfDirective', () => {

	beforeEach(() => {
		parent = document.createElement('div');
	});

	it('should control simple element', () => {
		let scope = {
			a: false,
		};

		let template = createTemplate(parent, '<template [s:if]="!a">hello</template>', scope, [IfDirective]);

		expect(parent.innerHTML).to.be.equal('hello<template></template>');

		scope.a = true;
		template.checkWatchers();

		expect(parent.innerHTML).to.be.equal('<template></template>');

		scope.a = false;
		template.checkWatchers();

		expect(parent.innerHTML).to.be.equal('hello<template></template>');
	});

	it('should correctly call life cycle events on directive', () => {
		let calledInit = 0;
		let calledDestroy = 0;

		@Directive({
			selector: 'directive',
		})
		class TestDirective implements OnInit, OnDestroy {
			onInit() {
				calledInit++;
			}
			onDestroy() {
				calledDestroy++;
			}
		}

		let scope = {
			a: true,
		};

		let template = createTemplate(parent, '<template [s:if]="!a"><directive></directive></template>', scope, [IfDirective, TestDirective]);

		expect(calledInit).to.be.equal(0);
		expect(calledDestroy).to.be.equal(0);

		scope.a = false;
		template.checkWatchers();

		expect(calledInit).to.be.equal(1);
		expect(calledDestroy).to.be.equal(0);

		scope.a = true;
		template.checkWatchers();

		expect(calledInit).to.be.equal(1);
		expect(calledDestroy).to.be.equal(1);
	});

});
