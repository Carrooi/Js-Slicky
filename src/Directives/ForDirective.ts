import {Directive, Input, Required} from '../Entity/Metadata';
import {Compiler} from '../Compiler';
import {OnUpdate, OnInit, OnDestroy} from '../Interfaces';
import {ChangeDetectionAction} from '../constants';
import {ElementRef} from '../Templating/ElementRef';
import {TemplateRef} from '../Templating/TemplateRef';
import {RenderableView} from '../Views/RenderableView';
import {EmbeddedView} from '../Views/EmbeddedView';
import {ViewFactory} from '../Views/ViewFactory';
import {Dom} from '../Util/Dom';
import {Helpers} from '../Util/Helpers';
import {IterableDifferFactory, IterableDiffer, TrackByFn} from '../ChangeDetection/IterableDiffer';


enum Exports
{
	Index,
	Item,
}


@Directive({
	selector: '[\\[s\\:for\\]][\\[s\\:for-of\\]]',
	compileInner: false,
})
export class ForDirective implements OnUpdate, OnInit, OnDestroy
{


	private compiler: Compiler;

	private el: ElementRef;

	private view: RenderableView;

	private viewFactory: ViewFactory;

	private templateRef: TemplateRef;

	private differFactory: IterableDifferFactory;

	private differ: IterableDiffer;

	private iterated: {[key: string]: EmbeddedView} = {};

	private exports: {[type: number]: string} = {};


	@Required()
	@Input('s:for')
	public sFor: any;

	@Required()
	@Input('s:forOf')
	public sForOf: any;

	@Input('s:forTrackBy')
	public sForTrackBy: TrackByFn;


	constructor(compiler: Compiler, el: ElementRef, view: RenderableView, viewFactory: ViewFactory, templateRef: TemplateRef, differFactory: IterableDifferFactory)
	{
		this.el = el;
		this.compiler = compiler;
		this.view = view;
		this.viewFactory = viewFactory;
		this.templateRef = templateRef;
		this.differFactory = differFactory;
	}


	public onInit(): void
	{
		let attributes = ElementRef.getAttributes(this.el.nativeEl);
		for (let name in attributes) {
			if (attributes.hasOwnProperty(name) && attributes[name].directiveExport) {
				if (attributes[name].expression === '') {
					this.exports[Exports.Item] = name;
				} else if (attributes[name].expression === 'index') {
					this.exports[Exports.Index] = name;
				}
			}
		}

		this.differ = this.differFactory.create(this.sForOf, this.sForTrackBy);

		this.update();
	}


	public onDestroy(): void
	{
		for (let key in this.iterated) {
			if (this.iterated.hasOwnProperty(key)) {
				this.view.removeChildView(this.iterated[key]);
			}
		}

		this.iterated = {};
	}


	public onUpdate(inputName: string, value: any): void
	{
		if (inputName !== 'sForOf' || !this.differ) {
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
		let view = this.viewFactory.createEmbeddedView(this.view, this.templateRef);

		if (typeof this.exports[Exports.Item] !== 'undefined') {
			view.addParameter(this.exports[Exports.Item], value);
		}

		if (typeof this.exports[Exports.Index] !== 'undefined') {
			view.addParameter(this.exports[Exports.Index], key);
		}

		view.attach(insertBefore);
		this.compiler.compileNodes(view, view.nodes);

		this.iterated[key + ''] = view;
	}


	private removeItem(key: string|number): void
	{
		if (typeof this.iterated[key] === 'undefined') {
			return;
		}

		this.iterated[key].detach();

		delete this.iterated[key];
	}


	private updateItem(key: string|number, value: any): void
	{
		let view = this.iterated[key];
		let refresh = false;

		if (typeof this.exports[Exports.Item] !== 'undefined') {
			view.parameters[this.exports[Exports.Item]] = value;
			refresh = true;
		}

		if (typeof this.exports[Exports.Index] !== 'undefined') {
			view.parameters[this.exports[Exports.Index]] = key;
			refresh = true;
		}

		if (refresh) {
			view.changeDetectorRef.refresh();
		}
	}


	private updateItemKey(previousKey: string|number, currentKey: string|number): void
	{
		let view = this.iterated[previousKey];
		delete this.iterated[previousKey];
		this.iterated[currentKey] = view;

		if (typeof this.exports[Exports.Index] !== 'undefined') {
			view.parameters[this.exports[Exports.Index]] = currentKey;
			view.changeDetectorRef.refresh();
		}
	}

}
