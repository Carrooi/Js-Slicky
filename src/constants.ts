import {ExpressionParserOptions} from './Parsers/ExpressionParser';


export enum ChangeDetectionStrategy
{
	Default,
	OnPush,
	Disabled,
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
		storeLocally: true,
	},
	filterProvider: '_t.filter(%value, "%filter", [%args])',
};
