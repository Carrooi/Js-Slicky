import {RenderableView} from './RenderableView';
import {ElementRef} from '../Templating/ElementRef';
import {Container} from '../DI/Container';
import {DefaultFilters} from '../Templating/Filters/DefaultFilters';
import {ParametersList} from '../Interfaces';


export class ApplicationView extends RenderableView
{


	constructor(container: Container, el: ElementRef, directives: Array<any>, parameters: ParametersList = {})
	{
		super(container, el, null, parameters);

		this.directives = directives;

		for (let i = 0; i < DefaultFilters.length; i++) {
			this.addFilter(DefaultFilters[i]);
		}
	}

}
