import {Strings} from '../../Util/Strings';
import {Filter, } from './Metadata';


@Filter({
	name: 'truncate',
})
export class TruncateFilter
{


	public transform(str: string, length: number, append: string = '&hellip;'): string
	{
		return length >= str.length ? str : (str.substr(0, length - 1) + append);
	}

}


@Filter({
	name: 'substr',
})
export class SubstrFilter
{


	public transform(str: string, from: number, length: number): string
	{
		return str.substr(from, length);
	}

}


@Filter({
	name: 'trim',
})
export class TrimFilter
{


	public transform(str: string): string
	{
		return str.trim();
	}

}


@Filter({
	name: 'replace',
})
export class ReplaceFilter
{


	public transform(str: string, search: string, replace: string = ''): string
	{
		return str.replace(new RegExp(Strings.escapeRegExp(search), 'g'), replace);
	}

}


@Filter({
	name: 'join',
})
export class JoinFilter
{


	public transform(list: Array<string>, glue: string): string
	{
		return list.join(glue);
	}

}


@Filter({
	name: 'lower',
})
export class LowerFilter
{


	public transform(str: string): string
	{
		return str.toLowerCase();
	}

}


@Filter({
	name: 'upper',
})
export class UpperFilter
{


	public transform(str: string): string
	{
		return str.toUpperCase();
	}

}


@Filter({
	name: 'firstUpper',
})
export class FirstUpperFilter
{


	public transform(str: string): string
	{
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

}


@Filter({
	name: 'length',
})
export class LengthFilter
{


	public transform(str: string|Array<any>): number
	{
		return str.length;
	}

}


@Filter({
	name: 'json',
})
export class JsonFilter
{


	public transform(obj: any): string
	{
		return JSON.stringify(obj);
	}

}


export let DefaultFilters: Array<any> = [
	TruncateFilter,
	SubstrFilter,
	TrimFilter,
	ReplaceFilter,
	JoinFilter,
	LowerFilter,
	UpperFilter,
	FirstUpperFilter,
	LengthFilter,
	JsonFilter,
];
