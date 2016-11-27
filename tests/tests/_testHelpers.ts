import {ParametersList} from '../../src/Interfaces';
import {Component} from '../../src/Entity/Metadata';
import {Container} from '../../src/DI/Container';
import {Translator} from '../../src/Translations/Translator';
import {RootCompiler} from "../../src/Templating/Compilers/RootCompiler";
import {DirectiveParser} from "../../src/Entity/DirectiveParser";
import {AbstractComponentTemplate} from "../../src/Templating/Templates/AbstractComponentTemplate";
import {ApplicationTemplate} from "../../src/Templating/Templates/ApplicationTemplate";
import {TemplatesStorage} from "../../src/Templating/Templates/TemplatesStorage";


let prepareCompiler = (directiveType: any, parameters: ParametersList = {}, container?: Container): RootCompiler => {
	if (!container) {
		container = new Container;
	}

	let applicationTemplate = new ApplicationTemplate(container, parameters);
	let templatesStorage = new TemplatesStorage;

	return new RootCompiler(container, templatesStorage, applicationTemplate, directiveType, DirectiveParser.parse(directiveType));
};


export let processDirective = (parent: HTMLElement, directiveType: any, parameters: ParametersList = {}): any => {
	return prepareCompiler(directiveType, parameters).processDirective(parent);
};


export let processComponent = (parent: HTMLElement, directiveType: any, parameters: ParametersList = {}): any => {
	return prepareCompiler(directiveType, parameters).processComponent(parent);
};


export let createTemplate = (parent: HTMLElement, html: string, parameters: ParametersList = {}, directives: Array<any> = [], services: Array<any> = [], filters: Array<any> = [], translations: {} = {}): AbstractComponentTemplate => {
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

	let compiler = prepareCompiler(SuperTestComponent, parameters, container);
	let template = compiler.processComponent(parent);

	return template;
};
