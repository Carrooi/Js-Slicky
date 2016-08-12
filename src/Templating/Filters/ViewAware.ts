import {RenderableView} from '../../Views/RenderableView';


export interface ViewAware
{


	onView(view: RenderableView): void;

}
