import {Directive, Input, Required} from '../Entity/Metadata';


@Directive({
	selector: '[\\[s\\:not-parse\\]]',
	compileInner: false,
})
export class NotParseDirective
{


	@Required()
	@Input('s:not-parse')
	public notParse: any;

}
