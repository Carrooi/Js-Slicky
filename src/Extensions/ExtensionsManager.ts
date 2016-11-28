import {AbstractExtension} from './AbstractExtension';
import {AbstractComponentTemplate} from '../Templating/Templates/AbstractComponentTemplate';
import {ElementRef} from '../Templating/ElementRef';
import {CustomServiceDefinition} from '../DI/Container';


export class ExtensionsManager
{


	private extensions: Array<AbstractExtension> = [];


	public addExtension(extension: AbstractExtension): void
	{
		this.extensions.push(extension);
	}


	public getFilters(): Array<any>
	{
		let filters = [];

		for (let i = 0; i < this.extensions.length; i++) {
			filters = filters.concat(this.extensions[i].getFilters());
		}

		return filters;
	}


	public getDirectives(): Array<any>
	{
		let directives = [];

		for (let i = 0; i < this.extensions.length; i++) {
			directives = directives.concat(this.extensions[i].getDirectives());
		}

		return directives;
	}


	public doUpdateComponentServices(template: AbstractComponentTemplate, el: ElementRef, services: Array<CustomServiceDefinition>): void
	{
		this.callHook('doUpdateComponentServices', [template, el, services]);
	}


	private callHook(method: string, args: Array<any>): Array<any>
	{
		let result = [];

		for (let i = 0; i < this.extensions.length; i++) {
			let hook = this.extensions[i];
			let buf = hook[method].apply(hook, args);

			if (buf != null) {
				result.push(buf);
			}
		}

		return result;
	}

}
