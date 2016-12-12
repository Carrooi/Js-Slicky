import {ExpressionParserOptions} from './Parsers/ExpressionParser';


export enum ChangeDetectionStrategy
{
	Default,
	OnPush,
}


export enum ChangeDetectionAction
{
	Add,
	Update,
	Remove,
	UpdateKey,
}


export const DEFAULT_EXPRESSION_OPTIONS: ExpressionParserOptions = {
	variableProvider: {
		replacement: '_t.scope.findParameter("%root")',
		exclude: /^\$/,
	},
	filterProvider: '_t.filter(%value, "%filter", [%args])',
};
