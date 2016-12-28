import {AbstractTemplate} from './AbstractTemplate';
import {Container} from '../../DI/Container';
import {ParamsList} from '../../Translations/Translator';
import {OnDestroy} from '../../Interfaces';
import {Errors} from '../../Errors';
import {Dom} from '../../Util/Dom';
import {AbstractComponentTemplate} from './AbstractComponentTemplate';


export class ApplicationTemplate extends AbstractTemplate
{


	private el: HTMLElement;


	constructor(container: Container, el: HTMLElement, parameters: ParamsList = {})
	{
		super(container, parameters);

		this.el = el;
	}


	public detachElement(el: HTMLElement): void
	{
		if (!this.el.contains(el)) {
			throw Errors.canNotDetachElementOutsideOfApplication(Dom.getReadableName(el));
		}

		for (let i = this.children.length - 1; i >= 0; i--) {
			let child = <AbstractComponentTemplate>this.children[i];

			if (el.contains(child.elementRef.nativeElement)) {
				child.destroy();
				this.children.splice(i, 1);
			}
		}

		for (let i = this.directives.length - 1; i >= 0; i--) {
			let item = this.directives[i];

			if (el.contains(item.el.nativeElement) && typeof item.directive.onDestroy === 'function') {
				(<OnDestroy>item.directive).onDestroy();
				this.directives.splice(i, 1);
			}
		}
	}


	public checkWatchers(): boolean
	{
		return false;
	}

}
