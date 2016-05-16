export class Helpers
{


	public static isObject(obj: any): boolean
	{
		return Object.prototype.toString.call(obj) === '[object Object]';
	}


	public static isArray(obj: any): boolean
	{
		return Object.prototype.toString.call(obj) === '[object Array]';
	}


	public static toArray(obj: any): Array<any>
	{
		let copy = [];

		for (let i = 0; i < obj.length; i++) {
			copy.push(obj[i]);
		}

		return copy;
	}

}
