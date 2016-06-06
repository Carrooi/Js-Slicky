import {AbstractView} from '../../Views/AbstractView';


export interface ViewAware
{


	onView(view: AbstractView): void;

}
