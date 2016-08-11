import {Directive, Input, Required} from '../Entity/Metadata';
import {Compiler} from '../Compiler';
import {OnChange, OnDestroy, ForToken, ChangedItem} from '../Interfaces';
import {ChangeDetectionAction} from '../ChangeDetection/constants';
import {ElementRef} from '../Templating/ElementRef';
import {TemplateRef} from '../Templating/TemplateRef';
import {ComponentView} from '../Views/ComponentView';
import {EmbeddedView} from '../Views/EmbeddedView';
import {ForParser} from'../Parsers/ForParser';
import {Code} from '../Util/Code';
import {SafeEval} from '../Util/SafeEval';


@Directive({
	selector: '[\\[s\\:for\\]]',
	compileInner: false,
})
export class ForDirective implements OnChange, OnDestroy
{


	private compiler: Compiler;

	private view: ComponentView;

	private templateRef: TemplateRef;

	private expr: ForToken;

	private iterated: {[key: string]: EmbeddedView} = {};

	private dependency;


	@Required()
	@Input('s:for')
	public loop: any;


	constructor(compiler: Compiler, el: ElementRef, view: ComponentView, templateRef: TemplateRef)
	{
		this.compiler = compiler;
		this.view = view;
		this.templateRef = templateRef;

		let attr = ElementRef.getAttributes(el.nativeEl)['s:for'];

		this.expr = ForParser.parse(attr.expression);
		this.dependency = Code.interpolateObjectElement(this.view.parameters, this.expr.obj);
	}


	public onChange(inputName: string, changed: ChangedItem = null): boolean
	{
		if (changed) {
			for (let i = 0; i < changed.dependencies.length; i++) {
				let dependency = changed.dependencies[i];

				if (dependency.expr.code === this.expr.obj.code) {
					if (dependency.action === ChangeDetectionAction.DeepUpdate) {
						for (let j = 0; j < dependency.props.length; j++) {
							let prop = dependency.props[j];

							if (prop.action === ChangeDetectionAction.Add) {
								this.addItem(prop.property, prop.newValue);

							} else if (prop.action === ChangeDetectionAction.Remove) {
								this.removeItem(prop.property);
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
			}

		} else {
			this.update();
		}

		return false;
	}


	public onDestroy(): void
	{
		for (let key in this.iterated) {
			if (this.iterated.hasOwnProperty(key)) {
				this.view.removeEmbeddedView(this.iterated[key]);
			}
		}

		this.iterated = {};
	}


	private update(): void
	{
		let code: string = null;

		let keyName = '__slicky_key__';
		let fnName = '__slicky_iterate__';

		let obj = this.expr.obj.code;

		if (this.expr.type === ForParser.TYPE_ARRAY) {
			code =
				'for (var ' + keyName + ' = 0; ' + keyName + ' < ' + obj + '.length; ' + keyName + '++) { ' +
					fnName + '(' + keyName + ', ' + obj + '[' + keyName + ']); ' +
				'}'
			;

		} else {
			code =
				'for (var ' + keyName + ' in ' + obj + ') { ' +
					'if (' + obj + '.hasOwnProperty(' + keyName + ')) { ' +
						fnName + '(' + keyName + ', ' + obj + '[' + keyName + ']); ' +
					'} ' +
				'}'
			;
		}

		let parameters = {};
		for (let key in this.view.parameters) {
			if (this.view.parameters.hasOwnProperty(key)) {
				parameters[key] = this.view.parameters[key];
			}
		}

		parameters[fnName] = (key, value) => {
			this.addItem(key, value);
		};

		SafeEval.run(code, parameters);
	}


	private addItem(key: string|number, value: any): void
	{
		let view = this.view.createEmbeddedView(this.templateRef);

		if (this.expr.key && this.expr.key.exportable) {
			view.addParameter(this.expr.key.name, key);
		}

		if (this.expr.value.exportable) {
			view.addParameter(this.expr.value.name, value);
		}

		this.compiler.compileNodes(view, view.nodes);

		this.iterated[key + ''] = view;
	}


	public removeItem(key: string|number): void
	{
		if (typeof this.iterated[key] === 'undefined') {
			return;
		}

		this.iterated[key].detach();

		delete this.iterated[key];
	}

}
