import {ChangedObject} from './Util/Watcher';


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
