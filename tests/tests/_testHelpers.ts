import {ParametersList} from '../../src/Interfaces';
import {Component} from '../../src/Entity/Metadata';
import {Container} from '../../src/DI/Container';
import {Application, ApplicationOptions} from '../../src/Application';
import {Translator} from '../../src/Translations/Translator';
import {RootCompiler} from '../../src/Templating/Compilers/RootCompiler';
import {DirectiveParser} from '../../src/Entity/DirectiveParser';
import {AbstractComponentTemplate} from '../../src/Templating/Templates/AbstractComponentTemplate';
import {ApplicationTemplate} from '../../src/Templating/Templates/ApplicationTemplate';
import {MemoryStorage} from '../../src/Templating/Storages/MemoryStorage';
import {ExtensionsManager} from '../../src/Extensions/ExtensionsManager';
import {ExpressionParser, ExpressionParserOptions} from '../../src/Parsers/ExpressionParser';
import {AbstractExtension} from '../../src/Extensions/AbstractExtension';

import chai = require('chai');


let prepareCompiler = (parent: HTMLElement, directiveType: any, container?: Container): RootCompiler => {
	if (!container) {
		container = new Container;
	}

	let applicationTemplate = new ApplicationTemplate(container, parent);
	let templatesStorage = new MemoryStorage;
	let extensions = new ExtensionsManager;

	return new RootCompiler(container, templatesStorage, extensions, applicationTemplate, directiveType, DirectiveParser.parse(directiveType));
};


export let processDirective = (parent: HTMLElement, directiveType: any): any => {
	return prepareCompiler(parent, directiveType).processDirective(parent);
};


export let processComponent = (parent: HTMLElement, directiveType: any): any => {
	return prepareCompiler(parent, directiveType).processComponent(parent);
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
		useFactory: () => new Translator('en'),
	});

	let compiler = prepareCompiler(parent, SuperTestComponent, container);
	let template = compiler.processComponent(parent, parameters);

	return template;
};


export let runApplication = (directives: Array<any>, options: ApplicationOptions = {}, extensions: Array<AbstractExtension> = []): Application => {
	let container = new Container;
	let application = new Application(container, directives, options);

	for (let i = 0; i < extensions.length; i++) {
		application.addExtension(extensions[i]);
	}

	application.run();

	return application;
};


export let expectExpression = (code: string, expected: string, options?: ExpressionParserOptions) => {
	if (!options) {
		options = {
			autoWrap: false,
		};
	}

	chai.expect(new ExpressionParser(code, options).parse()).to.be.equal(expected);
};


export let expectExpressionError = (code: string, message: string, options: ExpressionParserOptions = {}) => {
	let parser = new ExpressionParser(code, options);

	chai.expect(() => {
		parser.parse();
	}).to.throw(Error, message);
};
