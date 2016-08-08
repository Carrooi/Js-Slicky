import {ApplicationView} from '../../core';
import {Container} from '../../di';


export class MockApplicationView extends ApplicationView
{


	constructor(container: Container)
	{
		super(container, <any>{}, <any>{});
	}

}
