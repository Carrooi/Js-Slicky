import {Strings} from '../../Util/Strings';


export var DefaultFilters = {

	truncate: function(str: string, length: number, append: string = '&hellip;'): string
	{
		return length >= str.length ? str : (str.substr(0, length - 1) + append);
	},

	substr: function(str: string, from: number, length: number): string
	{
		return str.substr(from, length);
	},

	trim: function(str: string): string
	{
		return str.trim();
	},

	replace: function(str: string, search: string, replace: string = ''): string
	{
		return str.replace(new RegExp(Strings.escapeRegExp(search), 'g'), replace);
	},

	join: function(list: Array<string>, glue: string): string
	{
		return list.join(glue);
	},

	lower: function(str: string): string
	{
		return str.toLowerCase();
	},

	upper: function(str: string): string
	{
		return str.toUpperCase();
	},

	firstUpper: function(str: string): string
	{
		return str.charAt(0).toUpperCase() + str.slice(1);
	},

	length: function(str: string|Array<any>): number
	{
		return str.length;
	},

	json: function(obj: any): string
	{
		return JSON.stringify(obj);
	},

};
