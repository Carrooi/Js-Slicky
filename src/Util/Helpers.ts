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


	public static each(obj: any, fn: (i: number|string, value: any) => any): any
	{
		let result;

		if (Helpers.isArray(obj)) {
			for (let i = 0; i < obj.length; i++) {
				result = fn(i, obj[i]);
				if (typeof result !== 'undefined') {
					return result;
				}
			}

		} else if (Helpers.isObject(obj)) {
			for (let key in obj) {
				if (obj.hasOwnProperty(key)) {
					result = fn(key, obj[key]);
					if (typeof result !== 'undefined') {
						return result;
					}
				}
			}

		} else {
			throw new Error('Can not iterate through ' + Helpers.type(obj) + '.');
		}

		return null;
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


	public static compare(a: any, b: any): boolean
	{
		let compareObjects = (a: any, b: any): boolean => {
			for (let name in a) {
				if (a.hasOwnProperty(name)) {
					if (!b.hasOwnProperty(name)) {
						return true;

					} else if (b[name] !== a[name]) {
						return true;
					}
				}
			}

			for (let name in b) {
				if (b.hasOwnProperty(name) && !a.hasOwnProperty(name)) {
					return true;
				}
			}

			return false;
		};

		let compareArrays = (a: Array<any>, b: Array<any>): boolean => {
			for (let k = 0; k < a.length; k++) {
				if (typeof b[k] === 'undefined') {
					return true;

				} else if (b[k] !== a[k]) {
					return true;
				}
			}

			for (let k = 0; k < b.length; k++) {
				if (typeof a[k] === 'undefined') {
					return true;
				}
			}

			return false;
		};

		if (Helpers.isObject(a)) {
			return compareObjects(a, b == null ? {} : b);

		} else if (Helpers.isArray(a)) {
			return compareArrays(a, b == null ? [] : b);
		}

		return a !== b;
	}

}
