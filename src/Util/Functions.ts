export class Functions
{


	public static getName(fn: Function): string
	{
		if (typeof fn['name'] === 'string') {
			return fn['name'];
		}

		return /^function\s+([\w\$]+)\s*\(/.exec(fn.toString())[1];
	}

}
