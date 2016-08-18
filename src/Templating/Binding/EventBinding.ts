import {IBinding} from './IBinding';
import {Dom} from '../../Util/Dom';
import {Helpers} from '../../Util/Helpers';
import {SafeEval} from '../../Util/SafeEval';
import {RenderableView} from '../../Views/RenderableView';


export class EventBinding implements IBinding
{


	private view: RenderableView;

	private el: Element;

	private call: string;

	private events: Array<string>;

	private listeners: Array<{event: string, listener: Function}> = [];


	constructor(view: RenderableView, el: Element, attr: string, call: string)
	{
		this.view = view;
		this.el = el;
		this.call = call;

		this.events = attr.split('|');
	}


	public attach(): void
	{
		for (let i = 0; i < this.events.length; i++) {
			((event) => {
				this.listeners.push({
					event: event,
					listener: Dom.addEventListener(this.el, event, this, (e: Event) => {
						this.view.eval(this.call, {
							'$event': e,
							'$this': this.el,
						});
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
