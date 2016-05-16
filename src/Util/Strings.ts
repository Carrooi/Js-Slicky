export class Strings
{


	public static escapeRegExp(str: string): string
	{
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

}
