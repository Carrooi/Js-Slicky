import {ExpressionParser} from '../../Parsers/ExpressionParser';
import {DEFAULT_EXPRESSION_OPTIONS} from '../../constants';
import {Helpers} from '../../Util/Helpers';


export abstract class AbstractCompiler
{


	protected templateExports: Array<string> = [];


	protected compileExpression(expression: string): string
	{
		let options = Helpers.clone(DEFAULT_EXPRESSION_OPTIONS, true);

		return (new ExpressionParser(expression, DEFAULT_EXPRESSION_OPTIONS)).parse();
	}

}
