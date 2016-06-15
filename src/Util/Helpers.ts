import {Arrays} from './Arrays';
import {Objects} from './Objects';


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


	public static clone(obj: any): any
	{
		if (Helpers.isArray(obj)) {
			return Arrays.clone(obj);
		} else if (Helpers.isObject(obj)) {
			return Objects.clone(obj);
		} else {
			return obj;
		}
	}

}
