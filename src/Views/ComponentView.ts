import {RenderableView} from './RenderableView';
import {ComponentInstance} from '../Entity/ComponentInstance';
import {Dom} from '../Util/Dom';


export class ComponentView extends RenderableView
{


	public component: ComponentInstance = null;


	public detach(): void
	{
		super.detach();

		if (this.component) {
			this.run(() => this.component.detach());
			this.component = null;
		}
	}


	public setComponent(instance: ComponentInstance, controllerName?: string): ComponentInstance
	{
		if (this.component) {
			throw new Error('Can\'t attach component "' + instance.definition.name + '" to element "' + Dom.getReadableName(<Element>this.el.nativeEl) + '" since it\'s already attached to component "' + this.component.definition.name + '".');
		}

		this.component = instance;

		let directives = instance.definition.metadata.directives;
		let filters = instance.definition.metadata.filters;
		let translations = instance.definition.metadata.translations;

		if (controllerName || instance.definition.metadata.controllerAs) {
			this.addParameter(controllerName ? controllerName : instance.definition.metadata.controllerAs, instance.instance);
		}

		for (let i = 0; i < directives.length; i++) {
			this.directives.push(directives[i]);
		}

		for (let i = 0; i < filters.length; i++) {
			this.addFilter(filters[i]);
		}

		for (let locale in translations) {
			if (translations.hasOwnProperty(locale)) {
				if (typeof this.translations[locale] === 'undefined') {
					this.translations[locale] = {};
				}

				for (let groupName in translations[locale]) {
					if (translations[locale].hasOwnProperty(groupName)) {
						this.translations[locale][groupName] = translations[locale][groupName];
					}
				}
			}
		}

		return this.component;
	}

}
