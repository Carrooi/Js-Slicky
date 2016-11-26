import {AbstractTemplate} from './AbstractTemplate';
import {Container} from '../../DI/Container';
import {ParamsList} from '../../Translations/Translator';


export class ApplicationTemplate extends AbstractTemplate
{


	constructor(container: Container, parameters: ParamsList = {})
	{
		super(container, parameters);

		this.changeDetector.disable();
	}

}
