export declare interface TypeToken
{
	value: any,
	type: number,
}


export class TypeParser
{


	public static TYPE_PRIMITIVE = 0;
	public static TYPE_EXPRESSION = 1;


	public static parse(part: string): TypeToken
	{
		part = part.trim();

		if (/^'.*'$|^".*"$/.test(part)) {
			return {
				value: part.slice(1, -1),
				type: TypeParser.TYPE_PRIMITIVE,
			};

		} else if (part === 'true') {
			return {
				value: true,
				type: TypeParser.TYPE_PRIMITIVE,
			};

		} else if (part === 'false') {
			return {
				value: false,
				type: TypeParser.TYPE_PRIMITIVE,
			};

		} else if (part === 'null') {
			return {
				value: null,
				type: TypeParser.TYPE_PRIMITIVE,
			};

		} else if (part === 'undefined') {
			return {
				value: undefined,
				type: TypeParser.TYPE_PRIMITIVE,
			};

		} else if (!isNaN(Number(part))) {
			return {
				value: Number(part),
				type: TypeParser.TYPE_PRIMITIVE,
			};
		}

		return {
			value: part,
			type: TypeParser.TYPE_EXPRESSION,
		};
	}

}
