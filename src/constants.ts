export enum ChangeDetectionStrategy
{
	Default,
	OnPush,
}


export enum ChangeDetectionAction
{
	Same,
	Add,
	Update,
	Remove,
	DeepUpdate,
}


export enum ExpressionDependencyType
{
	Object,
	Call,
}


export enum ExpressionCallType
{
	Static,
	Dynamic,
}
