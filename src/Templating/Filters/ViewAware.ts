import {ComponentView} from '../../Views/ComponentView';


export interface ViewAware
{


	onView(view: ComponentView): void;

}
