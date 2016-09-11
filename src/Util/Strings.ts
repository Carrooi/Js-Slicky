export class Strings
{


	public static escapeRegExp(str: string): string
	{
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}


	public static firstUpper(str: string): string
	{
		return str.charAt(0).toUpperCase() + str.slice(1);
	}


	public static hyphensToCamelCase(str: string): string
	{
		return str.replace(/-([a-z])/g, (match) => match[1].toUpperCase());
	}


	public static camelCaseToHyphens(str: string): string
	{
		return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
	}

}
