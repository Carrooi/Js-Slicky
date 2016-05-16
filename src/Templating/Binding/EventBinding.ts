import {IBinding} from './IBinding';
import {Dom} from '../../Util/Dom';
import {Code} from '../../Util/Code';
import {Objects} from '../../Util/Objects';
import {VariableParser} from '../Parsers/VariableParser';
import {ExpressionParser} from '../Parsers/ExpressionParser';
import {View} from '../../Views/View';


export class EventBinding implements IBinding
{


	private view: View;

	private el: Element;

	private attr: string;

	private call: string;

	private listener: Function;


	constructor(view: View, el: Element, attr: string, call: string)
	{
		this.view = view;
		this.el = el;
		this.attr = attr;
		this.call = call;
	}


	public attach(): void
	{
		let scope = Objects.clone(this.view.parameters);
		let parts = this.call.match(/^(.+)?\((.+)?\)$/);

		if (!parts) {
			throw new Error('EventBinding: can not parse "' + this.call + '".');
		}

		let variable = VariableParser.parse(parts[1]);
		let obj = Code.interpolateObjectElement(scope, variable);

		let expr = ExpressionParser.precompile('[' + parts[2] + ']');

		this.listener = Dom.addEventListener(this.el, this.attr, this, (e: Event) => {
			let innerScope = Objects.merge(scope, {
				'$event': e,
				'$this': this.el,
			});

			let args = ExpressionParser.parse(expr, innerScope);

			obj.obj[obj.key].apply(obj.obj, args);
		});
	}


	public detach(): void
	{
		Dom.removeEventListener(this.el, this.attr, this.listener);
	}


	public onChange(): void
	{
		this.detach();
		this.attach();
	}

}
