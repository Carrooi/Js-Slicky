export class Helpers
{


	public static type(obj: any): string
	{
		return Object.prototype.toString.call(obj);
	}


	public static isObject(obj: any): boolean
	{
		return Helpers.type(obj) === '[object Object]';
	}


	public static isArray(obj: any): boolean
	{
		return Helpers.type(obj) === '[object Array]';
	}


	public static toArray(obj: any): Array<any>
	{
		let copy = [];

		for (let i = 0; i < obj.length; i++) {
			copy.push(obj[i]);
		}

		return copy;
	}


	public static clone(obj: any): any
	{
		if (Helpers.isArray(obj)) {
			let clone = [];

			for (let i = 0; i < obj.length; i++) {
				clone.push(obj[i]);
			}

			return clone;

		} else if (Helpers.isObject(obj)) {
			let clone = {};

			for (let key in obj) {
				if (obj.hasOwnProperty(key)) {
					clone[key] = obj[key];
				}
			}

			return clone;

		} else {
			return obj;
		}
	}


	public static merge(obj: any, append: any): any
	{
		let type = Helpers.type(obj);
		let appendType = Helpers.type(append);

		if (type !== appendType) {
			throw new Error('Can not merge two different type of objects (' + type + ' and ' + appendType + ').');
		}

		if (type === '[object Array]') {
			for (let i = 0; i < append.length; i++) {
				obj.push(append[i]);
			}

		} else if (type === '[object Object]') {
			for (let key in append) {
				if (append.hasOwnProperty(key)) {
					obj[key] = append[key];
				}
			}

		} else {
			throw new Error('Can not merge object of type ' + type + '.');
		}

		return obj;
	}


	public static hyphenToCamelCase(str: string): string
	{
		return str.replace(/-([a-z])/g, (match) => match[1].toUpperCase());
	}

}
