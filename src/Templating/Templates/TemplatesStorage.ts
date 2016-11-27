export class TemplatesStorage
{


	private templates: {[name: string]: any} = {};


	public isTemplateExists(name: string): boolean
	{
		return typeof this.templates[name] !== 'undefined';
	}


	public save(name: string, templateType: any): void
	{
		this.templates[name] = templateType;
	}


	public getTemplate(name: string): any
	{
		return this.templates[name];
	}

}
