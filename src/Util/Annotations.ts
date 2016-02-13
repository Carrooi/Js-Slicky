import {global} from '../Facade/Lang';


let Reflect = global.Reflect;


export class Annotations
{


	public static hasAnnotation(obj: any, annotationDefinition: any): boolean
	{
		return Annotations.getAnnotation(obj, annotationDefinition) !== null;
	}


	public static getAnnotation(obj: any, annotationDefinition: any): any
	{
		if (!Reflect.hasMetadata('annotations', obj)) {
			return null;
		}

		let annotations = Reflect.getMetadata('annotations', obj);

		for (let i = 0; i < annotations.length; i++) {
			if (annotations[i] instanceof annotationDefinition) {
				return annotations[i];
			}
		}

		return null;
	}

}
