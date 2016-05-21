import {IBinding} from './IBinding';
import {Expression} from '../../Parsers/ExpressionParser';
import {View} from '../../Views/View';


export class TextBinding implements IBinding
{


	private text: Text;

	private expr: Expression;

	private view: View;

	private originalText: string;


	constructor(text: Text, expr: Expression, view: View)
	{
		this.text = text;
		this.expr = expr;
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
		this.text.nodeValue = this.view.applyFilters(value, this.expr);
	}

}
