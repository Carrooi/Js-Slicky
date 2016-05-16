import {global, ConcreteType} from '../Facade/Lang';
import {Functions} from '../Util/Functions';
import {Annotations} from '../Util/Annotations';
import {Injectable, InjectableMetadataDefinition} from './Metadata';


let Reflect = global.Reflect;


export declare interface CustomServiceDefinition
{
	service: any,
	options: ProvideOptions,
}


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


	public provide(service: ConcreteType|Array<ConcreteType|Array<ConcreteType|ProvideOptions>>, options: ProvideOptions = {}): void
	{
		if (Object.prototype.toString.call(service) === '[object Array]') {
			for (let i = 0; i < service.length; i++) {
				if (Object.prototype.toString.call(service[i]) === '[object Array]' && service[i].length === 2) {
					this.provide(service[i][0], service[i][1]);
				} else {
					this.provide(service[i]);
				}
			}

			return;
		}

		if (!Annotations.hasAnnotation(service, InjectableMetadataDefinition) && typeof options.useFactory === 'undefined') {
			throw new Error('Can not register ' + Functions.getName(<ConcreteType>service) + ' service into DI container without @Injectable() annotation.');
		}

		this.services.push({
			service: <ConcreteType>service,
			options: options,
			instance: null,
		});
	}


	public get(service: ConcreteType): any
	{
		let instance = this.getFromList(this.services, service);

		if (!instance) {
			throw new Error('Service ' + Functions.getName(service) + ' is not registered in DI container.');
		}

		return instance;
	}


	public create(obj: ConcreteType, use: Array<CustomServiceDefinition> = []): any
	{
		let services = Reflect.getMetadata('design:paramtypes', obj);
		if (!services) {
			services = [];
		}

		let inject = [];
		for (let i = 0; i < services.length; i++) {
			let instance = this.getFromList(use, services[i]);

			if (!instance) {
				instance = this.get(services[i]);
			}

			inject.push(instance);
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


	private getFromList(services: Array<Service>, service: ConcreteType): any
	{
		for (let i = 0; i < services.length; i++) {
			if (services[i].service === service) {
				if (services[i].instance == null) {
					if (typeof services[i].options.useFactory !== 'undefined') {
						services[i].instance = this.create(<ConcreteType>services[i].options.useFactory);
					} else {
						services[i].instance = this.create(services[i].service);
					}
				}

				return services[i].instance;
			}
		}

		return null;
	}

}
