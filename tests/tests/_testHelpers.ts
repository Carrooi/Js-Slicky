import {ParametersList} from '../../src/Interfaces';
import {Component} from '../../src/Entity/Metadata';
import {Container} from '../../src/DI/Container';
import {Translator} from '../../src/Translations/Translator';
import {RootCompiler} from "../../src/Templating/Compilers/RootCompiler";
import {DirectiveParser} from "../../src/Entity/DirectiveParser";
import {AbstractComponentTemplate} from "../../src/Templating/Templates/AbstractComponentTemplate";
import {ApplicationTemplate} from "../../src/Templating/Templates/ApplicationTemplate";


export var processDirective = (parent: HTMLElement, directiveType: any, parameters: ParametersList = {}): any => {
	let container = new Container;
	let applicationTemplate = new ApplicationTemplate(container, parameters);
	let compiler = new RootCompiler(container, applicationTemplate, directiveType, DirectiveParser.parse(directiveType));

	 return compiler.processDirective(parent);
};


export var processComponent = (parent: HTMLElement, directiveType: any, parameters: ParametersList = {}): any => {
	let container = new Container;
	let applicationTemplate = new ApplicationTemplate(container, parameters);
	let compiler = new RootCompiler(container, applicationTemplate, directiveType, DirectiveParser.parse(directiveType));

	return compiler.processComponent(parent);
};


export var createTemplate = (parent: HTMLElement, html: string, parameters: ParametersList = {}, directives: Array<any> = [], services: Array<any> = [], filters: Array<any> = [], translations: {} = {}): AbstractComponentTemplate => {
	@Component({
		selector: 'test',
		template: html,
		directives: directives,
		filters: filters,
		translations: {
			en: translations,
		},
	})
	class SuperTestComponent {}

	let container = new Container;
	container.provide(services);
	container.provide(Translator, {
		useFactory: () => {
			let translator = new Translator;
			translator.locale = 'en';
			return translator;
		},
	});

	var applicationTemplate = new ApplicationTemplate(container, parameters);
	let compiler = new RootCompiler(container, applicationTemplate, SuperTestComponent, DirectiveParser.parse(SuperTestComponent));
	let template = compiler.processComponent(parent);

	return template;
};
