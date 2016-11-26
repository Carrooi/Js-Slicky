import {Directive, Input, Required} from '../Entity/Metadata';
import {OnUpdate, OnInit, OnDestroy} from '../Interfaces';
import {ChangeDetectionAction} from '../constants';
import {TemplateRef} from '../Templating/TemplateRef';
import {Helpers} from '../Util/Helpers';
import {IterableDifferFactory, IterableDiffer, TrackByFn} from '../ChangeDetection/IterableDiffer';
import {EmbeddedTemplate} from '../Templating/Templates/EmbeddedTemplate';


@Directive({
	selector: '[s:for][s:forOf]',
})
export class ForDirective implements OnUpdate, OnInit, OnDestroy
{


	private templateRef: TemplateRef;

	private differFactory: IterableDifferFactory;

	private differ: IterableDiffer;

	private iterated: {[key: string]: EmbeddedTemplate} = {};


	@Required()
	@Input('s:for')
	public sFor: any;

	@Required()
	@Input('s:forOf')
	public sForOf: any;

	@Input('s:forTrackBy')
	public sForTrackBy: TrackByFn;


	constructor(templateRef: TemplateRef, differFactory: IterableDifferFactory)
	{
		this.templateRef = templateRef;
		this.differFactory = differFactory;
	}


	public onInit(): void
	{
		this.differ = this.differFactory.create(this.sForOf, this.sForTrackBy);
		this.update();
	}


	public onDestroy(): void
	{
		Helpers.each(this.iterated, (name: string, template: EmbeddedTemplate) => {
			template.remove();
		});

		this.iterated = {};
	}


	public onUpdate(inputName: string, value: any): void
	{
		if (inputName !== 'sForOf') {
			return;
		}

		let changes = this.differ.check();
		if (changes) {
			for (let i = 0; i < changes.length; i++) {
				let prop = changes[i];

				if (prop.action === ChangeDetectionAction.Add) {
					this.addItem(prop.property, prop.newValue);

				} else if (prop.action === ChangeDetectionAction.Remove) {
					this.removeItem(prop.property);

				} else if (prop.action === ChangeDetectionAction.Update) {
					this.updateItem(prop.property, prop.newValue);

				} else if (prop.action === ChangeDetectionAction.UpdateKey) {
					this.updateItemKey(prop.oldValue, prop.newValue);

				}
			}

		} else {
			for (let name in this.iterated) {
				if (this.iterated.hasOwnProperty(name)) {
					this.removeItem(name);
				}
			}

			this.update();
		}
	}


	private update(): void
	{
		Helpers.each(this.sForOf, (key: number|string, value: any) => {
			this.addItem(key, value);
		});
	}


	private addItem(key: string|number, value: any, insertBefore?: Node): void
	{
		this.iterated[key] = this.templateRef.createEmbeddedTemplate({
			index: key,
			'': value,
		}, insertBefore);
	}


	private removeItem(key: string|number): void
	{
		if (typeof this.iterated[key] === 'undefined') {
			return;
		}

		this.iterated[key].remove();
		delete this.iterated[key];
	}


	private updateItem(key: string|number, value: any): void
	{
		if (typeof this.iterated[key] === 'undefined') {
			return;
		}
		
		this.iterated[key].updateExports({
			index: key,
			'': value,
		});
	}


	private updateItemKey(previousKey: string|number, currentKey: string|number): void
	{
		if (typeof this.iterated[previousKey] === 'undefined') {
			return;
		}

		let template = this.iterated[previousKey];
		delete this.iterated[previousKey];
		this.iterated[currentKey] = template;

		template.updateExports({
			index: currentKey,
		});
	}

}
