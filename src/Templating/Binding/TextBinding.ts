import {IBinding} from './IBinding';
import {RenderableView} from '../../Views/RenderableView';


export class TextBinding implements IBinding
{


	private text: Text;

	private view: RenderableView;

	private originalText: string;


	constructor(text: Text, view: RenderableView)
	{
		this.text = text;
		this.view = view;
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
