import {RenderableView} from './RenderableView';
import {ComponentView} from './ComponentView';
import {EmbeddedView} from './EmbeddedView';
import {Container} from '../DI/Container';
import {ElementRef} from '../Templating/ElementRef';
import {TemplateRef} from '../Templating/TemplateRef';
import {Helpers} from '../Util/Helpers';


export class ViewFactory
{


	private container: Container;


	constructor(container: Container)
	{
		this.container = container;
	}


	public createComponentView(parent: RenderableView, el: ElementRef): ComponentView
	{
		if (el.view instanceof ComponentView) {
			return <ComponentView>el.view;
		}

		let translations = Helpers.clone(parent.translations);
		let view = new ComponentView(this.container, el, parent);
		view.translations = translations;

		return view;
	}


	public createEmbeddedView(parent: RenderableView, template: TemplateRef): EmbeddedView
	{
		let view = new EmbeddedView(this.container, parent, template);
		view.translations = parent.translations;

		return view;
	}

}
