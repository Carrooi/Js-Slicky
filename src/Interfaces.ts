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


export declare interface ChangedProperty
{
	prop: string,
	action: string,
	newValue: any,
	oldValue: any,
}


export declare interface ChangedObject
{
	expr: string,
	props?: Array<ChangedProperty>,
}


export declare interface WatcherCallback
{
	(changed: Array<ChangedObject>): void,
}


export declare interface WatcherDependency
{
	clones: {[key: string]: any},
	obj: any,
	dependency: VariableToken,
}


export declare interface WatcherListener
{
	dependencies: Array<WatcherDependency>,
	cb: WatcherCallback,
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


	onChange(inputName: string, changed?: Array<ChangedObject>): boolean;

}
