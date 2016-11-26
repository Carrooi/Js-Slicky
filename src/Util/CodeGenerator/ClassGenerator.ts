import {Strings} from '../Strings';
import {SafeEval} from '../SafeEval';
import {Helpers} from '../Helpers';
import {MethodGenerator} from './MethodGenerator';


declare interface Property
{
	name: string,
	value: string,
}


export class ClassGenerator
{


	private name: string;

	private extendsFrom: string;

	private ctor: {args: Array<string>, body: string} = null;

	private methods: Array<MethodGenerator> = [];

	private properties: Array<Property> = [];

	public methodBodySplitter: string = '\n';


	constructor(name: string, extendsFrom?: string)
	{
		this.name = name;
		this.extendsFrom = extendsFrom;
	}


	public getName(): string
	{
		return this.name;
	}


	public setConstructor(args: Array<string>, body: string = ''): void
	{
		this.ctor = {
			args: args,
			body: body,
		};
	}


	public addMethod(name: string, args: Array<string> = [], body: string|Array<string> = []): MethodGenerator
	{
		let method = new MethodGenerator(this, name);

		method.setArguments(args);
		method.setBody(body);

		this.methods.push(method);

		return method;
	}


	public addProperty(name: string, value: string): void
	{
		this.properties.push({
			name: name,
			value: value,
		});
	}


	public superCall(method, args: Array<string> = []): string
	{
		let argsCode = args.length ? (', ' + args.join(', ')) : '';

		return method === 'constructor' ?
			'_super.call(this' + argsCode + ');' :
			'_super.prototype.' + method + '.call(this' + argsCode + ');'
		;
	}


	public toString(): string
	{
		let args: Array<string> = this.ctor ? this.ctor.args : [];
		let body: string = this.ctor ? this.ctor.body : (this.extendsFrom ? '_super.apply(this, arguments);' : '');

		let result = ['function ' + this.name + '(' + args.join(', ') + ') {' + (body === '' ? '' : ('\n' + Strings.indent(body) + '\n')) + '}'];

		for (let i = 0; i < this.properties.length; i++) {
			result.push(this.generateProperty(this.properties[i]));
		}

		for (let i = 0; i < this.methods.length; i++) {
			result.push(this.methods[i].generate(this.methodBodySplitter));
		}

		return (
			(this.extendsFrom ? (this.getExtendsFunction() + '\n') : '') +
			'return (function(' + (this.extendsFrom ? '_super' : '') + ') {\n' +
				(this.extendsFrom ? ('\t__extends(' + this.name + ', ' + this.extendsFrom + ');\n') : '') +
				Strings.indent(result.join('\n')) + '\n' +
				'\treturn ' + this.name + ';\n' +
			'})(' + (this.extendsFrom ? this.extendsFrom : '') + ');'
		);
	}


	public generate(scope: any = {}): any
	{
		return SafeEval.run(this.toString(), scope);
	}


	private getExtendsFunction(): string
	{
		return (
			'var __extends = function(d, b) {\n' +
				'\tfor (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n' +
				'\tfunction __() { this.constructor = d; }\n' +
				'\td.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n' +
			'};'
		);
	}


	private generateProperty(property: Property): string
	{
		return this.name + '.prototype.' + property.name + ' = ' + property.value + ';';
	}

}
