import {ChangeDetectionAction} from './constants';


// ------------ PARAMETERS


export declare interface ParametersList
{
	[name: string]: any;
}


// ------------ PARSING


export declare interface ExpressionFilter
{
	name: string,
	dependencies: Array<ExpressionDependency>,
	arguments: Array<string>,
}


export declare interface ExpressionDependency
{
	code: string,
	root: string,
}


export declare interface Expression
{
	code: string,
	dependencies: Array<ExpressionDependency>,
}


// ------------ CHANGE DETECTION


export declare interface ChangedDependencyProperty {
	action: ChangeDetectionAction,
	property: string,
	newValue: any,
	oldValue: any,
}


// ------------ TEMPLATING


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
