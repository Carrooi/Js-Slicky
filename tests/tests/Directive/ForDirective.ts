import {OnInit, OnDestroy} from '../../../core';
import {ForDirective} from '../../../common';
import {IterableDifferFactory} from '../../../src/ChangeDetection/IterableDiffer';
import {Directive} from '../../../src/Entity/Metadata';

import {createTemplate} from '../_testHelpers';

import chai = require('chai');


let expect = chai.expect;

let parent: HTMLDivElement;


describe('#Directives/ForDirective', () => {

	beforeEach(() => {
		parent = document.createElement('div');
	});

	describe('bind()', () => {

		it('should iterate through simple array list', () => {
			let scope = {
				users: ['David', 'John', 'Clare'],
			};

			let template = createTemplate(parent, '<template [s:for] #user [s:for-of]="users">- {{ user }} -</template>', scope, [ForDirective], [IterableDifferFactory]);

			expect(parent.innerText).to.be.equal('- David -- John -- Clare -');

			scope.users.push('Luke');
			template.changeDetector.check();

			expect(parent.innerText).to.be.equal('- David -- John -- Clare -- Luke -');

			scope.users.splice(1, 1);
			scope.users[2] = 'John';
			template.changeDetector.check();

			expect(parent.innerText).to.be.equal('- David -- Clare -- John -');
		});

		it('should iterate through simple array list with keys', () => {
			let scope = {
				users: ['David', 'John', 'Clare'],
			};

			let template = createTemplate(parent, '<template [s:for] #i="index" #user [s:for-of]="users">- {{ i + ": " + user }} -</template>', scope, [ForDirective], [IterableDifferFactory]);

			expect(parent.innerText).to.be.equal('- 0: David -- 1: John -- 2: Clare -');

			scope.users.push('Luke');
			template.changeDetector.check();

			expect(parent.innerText).to.be.equal('- 0: David -- 1: John -- 2: Clare -- 3: Luke -');

			scope.users.splice(1, 1);
			scope.users[2] = 'John';
			template.changeDetector.check();

			expect(parent.innerText).to.be.equal('- 0: David -- 1: Clare -- 2: John -');
		});

		it('should iterate through simple object', () => {
			let scope = {
				options: {
					one: 'foo',
					two: 'bar',
					three: 'baz',
				},
			};

			let template = createTemplate(parent, '<template [s:for] #value [s:for-of]="options">- {{ value }} -</template>', scope, [ForDirective], [IterableDifferFactory]);

			expect(parent.innerText).to.be.equal('- foo -- bar -- baz -');

			scope.options['four'] = 'qux';
			template.changeDetector.check();

			expect(parent.innerText).to.be.equal('- foo -- bar -- baz -- qux -');

			delete scope.options['two'];
			scope.options.three = 'bar';
			template.changeDetector.check();

			expect(parent.innerText).to.be.equal('- foo -- bar -- qux -');
		});

		it('should iterate through simple object with keys', () => {
			let scope = {
				options: {
					one: 'foo',
					two: 'bar',
					three: 'baz',
				},
			};

			let template = createTemplate(parent, '<template [s:for] #key="index" #value [s:for-of]="options">- {{ key }}: {{ value }} -</template>', scope, [ForDirective], [IterableDifferFactory]);

			expect(parent.innerText).to.be.equal('- one: foo -- two: bar -- three: baz -');

			scope.options['four'] = 'qux';
			template.changeDetector.check();

			expect(parent.innerText).to.be.equal('- one: foo -- two: bar -- three: baz -- four: qux -');

			delete scope.options['two'];
			scope.options.three = 'bar';
			template.changeDetector.check();

			expect(parent.innerText).to.be.equal('- one: foo -- three: bar -- four: qux -');
		});

		it('should update template when whole array is changed', () => {
			let scope = {
				users: ['David'],
			};

			let template = createTemplate(parent, '<template [s:for] #user [s:for-of]="users">- {{ user }} -</template>', scope, [ForDirective], [IterableDifferFactory]);

			expect(parent.innerText).to.be.equal('- David -');

			scope.users = ['Clare'];
			template.changeDetector.check();

			expect(parent.innerText).to.be.equal('- Clare -');
		});

		it('should create and destroy directive', () => {
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
				numbers: [1],
				visible: true,
			};

			let template = createTemplate(parent, '<template [s:for] [s:for-of]="numbers"><directive></directive></template>', scope, [TestDirective, ForDirective], [IterableDifferFactory]);

			scope.numbers = [];
			template.changeDetector.check();

			expect(calledInit).to.be.equal(1);
			expect(calledDestroy).to.be.equal(1);

			scope.numbers = [1];
			template.changeDetector.check();

			expect(calledInit).to.be.equal(2);
			expect(calledDestroy).to.be.equal(1);
		});

	});

});
