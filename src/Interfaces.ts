import {ChangeDetectionAction, ExpressionDependencyType, ExpressionCallType} from './constants';


// ------------ PARAMETERS


export declare interface ParametersList
{
	[name: string]: any;
}


// ------------ PARSING


export declare interface ExpressionFilter
{
	name: string,
	arguments: Array<Expression>,
}


export declare interface ExpressionDependency
{
	code: string,
	root: string,
	type: ExpressionDependencyType,
	exportable: boolean,
}


export declare interface Expression
{
	code: string,
	callType: ExpressionCallType,
	dependencies: Array<ExpressionDependency>,
	filters: Array<ExpressionFilter>,
}


export declare interface VariableToken
{
	code: string,
	name: string,
	exportable: boolean,
	path: Array<{value: any, type: number}>,
}


export declare interface ForToken
{
	code: string,
	key?: VariableToken,
	value: VariableToken,
	obj: VariableToken,
	type: number,
}


export declare interface InterpolatedObjectElement
{
	obj: any,
	key: string|number,
}


// ------------ CHANGE DETECTION


export declare interface ChangedDependencyProperty {
	action: ChangeDetectionAction,
	property: string,
	newValue: any,
	oldValue: any,
}


export declare interface ChangedDependency {
	action: ChangeDetectionAction,
	expr: ExpressionDependency,
	props: Array<ChangedDependencyProperty>,
}


export declare interface ChangedItem
{
	action: ChangeDetectionAction,
	dependencies: Array<ChangedDependency>,
}


// ------------ TEMPLATING


export declare interface AttributeProperty
{
	name: string;
	expression: string;
	directiveExport: boolean;
	property: boolean;
	event: boolean;
	bound: boolean;
}


export declare interface AttributesList
{
	[name: string]: AttributeProperty;
}


// ------------ LIFE CYCLE EVENTS


export interface OnInit
{


	onInit(): void;

}


export interface OnDestroy
{


	onDestroy(): void;

}


export interface OnUpdate
{


	onUpdate(inputName: string, value: any): void;

}


export interface OnChange
{


	onChange(inputName: string, changed?: ChangedItem): boolean;

}
