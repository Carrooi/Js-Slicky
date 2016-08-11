import {ChangeDetectionAction} from './ChangeDetection/constants';


// ------------ PARAMETERS


export declare interface ParametersList
{
	[name: string]: any;
}


// ------------ PARSING


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
	expr: VariableToken,
	props: Array<ChangedDependencyProperty>,
}


export declare interface ChangedItem
{
	action: ChangeDetectionAction,
	dependencies: Array<ChangedDependency>,
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
