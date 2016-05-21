import {IBinding} from './IBinding';
import {Dom} from '../../Util/Dom';
import {Code} from '../../Util/Code';
import {Objects} from '../../Util/Objects';
import {VariableParser} from '../../Parsers/VariableParser';
import {ExpressionParser} from '../../Parsers/ExpressionParser';
import {View} from '../../Views/View';


export class EventBinding implements IBinding
{


	private view: View;

	private el: Element;

	private call: string;

	private events: Array<string>;

	private listeners: Array<{event: string, listener: Function}> = [];


	constructor(view: View, el: Element, attr: string, call: string)
	{
		this.view = view;
		this.el = el;
		this.call = call;

		this.events = attr.split('|');
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

		for (let i = 0; i < this.events.length; i++) {
			((event) => {
				this.listeners.push({
					event: event,
					listener: Dom.addEventListener(this.el, event, this, (e: Event) => {
						let innerScope = Objects.merge(scope, {
							'$event': e,
							'$this': this.el,
						});

						let args = ExpressionParser.parse(expr, innerScope);

						obj.obj[obj.key].apply(obj.obj, args);
					}),
				});
			})(this.events[i]);
		}
	}


	public detach(): void
	{
		for (let i = 0; i < this.listeners.length; i++) {
			Dom.removeEventListener(this.el, this.listeners[i].event, this.listeners[i].listener);
		}

		this.listeners = [];
	}


	public onChange(): void
	{
		this.detach();
		this.attach();
	}

}
