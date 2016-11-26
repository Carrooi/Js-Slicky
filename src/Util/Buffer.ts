import {Helpers} from './Helpers';
import {Strings} from "./Strings";


export class Buffer<T>
{


	private data: Array<T> = [];


	constructor(data: T|Array<T> = [])
	{
		this.append(data);
	}


	public prepend(prepend: T|Array<T>): void
	{
		if (!Helpers.isArray(prepend)) {
			prepend = [<T>prepend];
		}

		for (let i = (<Array<T>>prepend).length - 1; i >= 0; i--) {
			this.data.unshift(prepend[i]);
		}
	}


	public append(append: T|Array<T>): void
	{
		if (!Helpers.isArray(append)) {
			append = [<T>append];
		}

		for (let i = 0; i < (<Array<T>>append).length; i++) {
			this.data.push(append[i]);
		}
	}


	public map(fn: (item: T) => T): void
	{
		for (let i = 0; i < this.data.length; i++) {
			this.data[i] = fn(this.data[i]);
		}
	}


	public merge(buffer: Buffer<T>): void
	{
		this.append(buffer.getData());
	}


	public isEmpty(): boolean
	{
		return this.data.length === 0;
	}


	public getData(): Array<T>
	{
		return this.data;
	}

}
