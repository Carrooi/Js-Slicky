import {Container} from '../../di';
import {Application, Component, Input, HostEvent, HostElement} from '../../core';
import {InputMetadataDefinition, HostEventMetadataDefinition, HostElementMetadataDefinition} from '../../src/Entity/Metadata';

import chai = require('chai');


let expect = chai.expect;
let application: Application = null;


describe('#Application', () => {

	beforeEach(() => {
		let container = new Container;
		application = new Application(container);
	});

});
