export class Functions
{


	public static getName(fn: Function): string
	{
		if (typeof fn['name'] === 'string') {
			return fn['name'];
		}

		return /^function\s+([\w\$]+)\s*\(/.exec(fn.toString())[1];
	}


	public static newInstance(fn: Function, args: Array<any> = []): any
	{
		let F = function(args): void {
			return fn.apply(null, args);
		};

		F.prototype = fn.prototype;

		return () => {
			return new F(args);
		};
	}

}
