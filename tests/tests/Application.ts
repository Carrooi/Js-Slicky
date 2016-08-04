import {Container} from '../../di';
import {Application} from '../../core';

import chai = require('chai');


let expect = chai.expect;
let application: Application = null;


describe('#Application', () => {

	beforeEach(() => {
		let container = new Container;
		application = new Application(container);
	});

});
