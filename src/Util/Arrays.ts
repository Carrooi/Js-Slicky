export class Arrays
{


	public static clone(obj: Array<any>): Array<any>
	{
		let clone = [];

		for (let i = 0; i < obj.length; i++) {
			clone.push(obj[i]);
		}

		return clone;
	}

}
