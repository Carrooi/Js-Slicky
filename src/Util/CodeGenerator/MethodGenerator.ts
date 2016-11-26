import {Strings} from '../Strings';
import {ClassGenerator} from './ClassGenerator';
import {Buffer} from '../Buffer';


export class MethodGenerator
{


	private parent: ClassGenerator;

	private name: string;

	private args: Array<string> = [];

	private body: Buffer<string> = new Buffer<string>();


	constructor(parent: ClassGenerator, name: string)
	{
		this.parent = parent;
		this.name = name;
	}


	public setArguments(args: Array<string>): void
	{
		this.args = args;
	}


	public getBody(): Buffer<string>
	{
		return this.body;
	}


	public setBody(body: string|Array<string>): void
	{
		this.body = new Buffer<string>();
		this.appendBody(body);
	}


	public appendBody(append: string|Array<string>): void
	{
		if (typeof append === 'string') {
			append = [<string>append];
		}

		for (let i = 0; i < append.length; i++) {
			if (append[i] !== '') {
				this.body.append(append[i]);
			}
		}
	}


	public generate(splitter: string = '\n'): string
	{
		let data = this.body.getData();
		let body = !data.length ? '' : ('\n' + Strings.indent(data.join(splitter)) + '\n');
		return this.parent.getName() + '.prototype.' + this.name + ' = function(' + this.args.join(', ') + ') {' + body + '};';
	}

}
