import 'es7-reflect-metadata/dist/browser';

import './tests/Util/Realm';
import './tests/Util/Dom';
import './tests/Util/Code';
import './tests/Util/SafeEval';

import './tests/Util/CodeGenerator/ClassGenerator';

import './tests/ChangeDetection/ChangeDetector';
import './tests/ChangeDetection/IterableDiffer';

import './tests/Tokenizer/Tokenizer';
import './tests/Tokenizer/Parser';

import './tests/Templating/Filters/Filters';

import './tests/Templating/QuerySelector';
import './tests/Templating/Compilers/RootCompiler.Directive';
import './tests/Templating/Compilers/RootCompiler.Component';
import './tests/Templating/Compilers/ComponentCompiler';
import './tests/Templating/Compilers/ComponentCompiler.directives';
import './tests/Templating/Compilers/ComponentCompiler.components';
import './tests/Templating/Compilers/ComponentCompiler.exports';
import './tests/Templating/Compilers/ComponentCompiler.filters';
import './tests/Templating/Compilers/ComponentCompiler.changeDetection';
import './tests/Templating/Compilers/ComponentCompiler.buildInDirectives';

import './tests/Translations/Translations';

import './tests/Parsers/ExpressionParser';
import './tests/Parsers/ExpressionParser.squareBrackets';
import './tests/Parsers/ExpressionParser.parenthesis';
import './tests/Parsers/ExpressionParser.braces';
import './tests/Parsers/ExpressionParser.update';
import './tests/Parsers/TemplateAttributeParser';
import './tests/Parsers/TextParser';
import './tests/Parsers/HTMLParser';
import './tests/Parsers/SelectorParser';

import './tests/Entity/DirectiveParser';

import './tests/Directive/IfDirective';
import './tests/Directive/ForDirective';
import './tests/Directive/ForDirective.trackBy';
import './tests/Directive/ClassDirective';
import './tests/Directive/AttrDirective';

import './tests/DI/Container';

import './tests/Application';
import './tests/Application.extensions';
