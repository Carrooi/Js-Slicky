import {IBinding} from './IBinding';


export class TextBinding implements IBinding
{


	private text: Text;

	private originalText: string;


	constructor(text: Text)
	{
		this.text = text;
		this.originalText = this.text.nodeValue;
	}


	public attach(): void
	{

	}


	public detach(): void
	{
		this.text.nodeValue = '{{ ' + this.originalText + ' }}';
	}


	public onUpdate(value: string): void
	{
		this.update(value);
	}


	private update(value: string): void
	{
		this.text.nodeValue = value;
	}

}
