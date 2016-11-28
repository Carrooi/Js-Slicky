# Extensions

Slicky can be extended with extensions (sometimes referred to as modules, 
plugins or eg. bundles).
 
```ts
import {AbstractExtension} from 'slicky/extensions';

class MyOwnExtension extends AbstractExtension
{

    public getServices()
    {
        return [
            MyOwnService,
        ];
    }
    
    public getFilters()
    {
        return [
            MyOwnFilter,
        ];
    }
    
    public getDirectives()
    {
        return [
            MyOwnDirective,
        ];
    }

}

application.addExtension(new MyOwnExtension);
```

**`Application.addExtension` must be called before `Application.run`**

## Methods

* `getServices()`: returns list of new services, same like in [provide method](./di.md)
* `getFilters()`: returns list of new filters
* `getDirectives()`: returns list of new directives

## Hooks

Extensions can be used also to alter default behaviour of internal parts of slicky
with hooks.

### `doUpdateComponentServices(template: AbstractComponentTemplate, el: ElementRef, services: Array<CustomServiceDefinition>)`

Changes list of additional services automatically passed into new components.
This is useful when you want to pass different services into each component. 

```ts
class ComponentExtension extends AbstractExtension
{

    public doUpdateComponentServices(template: AbstractComponentTemplate, el: ElementRef, services: Array<CustomServiceDefinition>): void
    {
        services.push({
            service: ComponentService,
            options: {
                useFactory: () => new ComponentService(template, el),
            },
        });
    }

}
```
