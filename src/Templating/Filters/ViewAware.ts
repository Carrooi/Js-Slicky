import {View} from '../../Views/View';


export interface ViewAware
{


	onView(view: View): void;

}
