import {ChangeDetectionAction} from './constants';


// ------------ PARAMETERS


export declare interface ParametersList
{
	[name: string]: any;
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
