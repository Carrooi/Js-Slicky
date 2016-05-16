export class Objects
{


	public static clone(obj: any): any
	{
		let clone = {};

		for (let key in obj) {
			if (obj.hasOwnProperty(key)) {
				clone[key] = obj[key];
			}
		}

		return clone;
	}


	public static merge(obj: any, append: any): any
	{
		for (let key in append) {
			if (append.hasOwnProperty(key)) {
				obj[key] = append[key];
			}
		}

		return obj;
	}

}
