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


export var Injectable = makeDecorator(InjectableMetadataDefinition);
export var Inject = makePropDecorator(InjectMetadataDefinition);
