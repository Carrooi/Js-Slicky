import {Container} from '../../di';
import {Application, Component, Input, Event, Element} from '../../core';
import {InputMetadataDefinition, EventMetadataDefinition, ElementMetadataDefinition} from '../../src/Entity/Metadata';

import chai = require('chai');


let expect = chai.expect;
let application: Application = null;


describe('#Application', () => {

	beforeEach(() => {
		let container = new Container;
		application = new Application(container);
	});

});
