import {Buffer} from "./Buffer";
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


	public static hash(str: string): number
	{
		let hash = 0;

		if (str.length === 0) {
			return hash;
		}

		for (let i = 0; i < str.length; i++) {
			let chr = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0;
		}

		if (hash < 0) {
			hash = hash * -1;
		}

		return hash;
	}


	public static addSlashes(str: string): string
	{
		return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
	}


	public static indent(str: string|Buffer<string>, count: number = 1): string
	{
		if (str instanceof Buffer) {
			str.map((item) => Strings.indent(item, count));
		} else {
			return (<string>str).replace(/^(?!\s*$)/mg, new Array(count + 1).join('\t'));
		}
	}

}
