import {global, ConcreteType} from '../Facade/Lang';
import {Functions} from '../Util/Functions';
import {Annotations} from '../Util/Annotations';
import {Injectable, InjectableMetadataDefinition} from './Metadata';


let Reflect = global.Reflect;


declare interface ProvideOptions
{
	useFactory?: Function;
}


declare interface Service
{
	service: ConcreteType;
	options?: ProvideOptions;
	instance?: any;
}


@Injectable()
export class Container
{


	private services: Array<Service> = [];


	constructor()
	{
		this.provide(Container, {
			useFactory: () => {
				return this;
			}
		});
	}


	public provide(service: ConcreteType, options?: ProvideOptions): void
	{
		if (!Annotations.hasAnnotation(service, InjectableMetadataDefinition)) {
			throw new Error('Can not register ' + Functions.getName(service) + ' service into DI container without @Injectable() annotation.');
		}

		this.services.push({
			service: service,
			options: options,
			instance: null,
		});
	}


	public get(service: ConcreteType): any
	{
		for (let i = 0; i < this.services.length; i++) {
			if (this.services[i].service === service) {
				if (this.services[i].instance === null) {
					if (typeof this.services[i].options !== 'undefined' && typeof this.services[i].options.useFactory !== 'undefined') {
						this.services[i].instance = this.create(<ConcreteType>this.services[i].options.useFactory);
					} else {
						this.services[i].instance = this.create(this.services[i].service);
					}
				}

				return this.services[i].instance;
			}
		}

		throw new Error('Service ' + Functions.getName(service) + ' is not registered in DI container.');
	}


	public create(obj: ConcreteType): any
	{
		let services = Reflect.getMetadata('design:paramtypes', obj);
		if (!services) {
			services = [];
		}

		let inject = [];
		for (let i = 0; i < services.length; i++) {
			inject.push(this.get(services[i]));
		}

		let construct = function(constructor, args) {
			function F(): void {
				let result = constructor.apply(this, args);
				if (result) {
					return result;
				}
			}

			F.prototype = constructor.prototype;

			return new F;
		};

		return construct(obj, inject);
	}

}
