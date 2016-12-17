import {CONST} from '../Facade/Lang';
import {makeDecorator, makePropDecorator} from '../Util/Decorators';



@CONST()
export class InjectableMetadataDefinition
{

}


@CONST()
export class InjectMetadataDefinition
{

}


export let Injectable = makeDecorator(InjectableMetadataDefinition);
export let Inject = makePropDecorator(InjectMetadataDefinition);
