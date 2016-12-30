import {ExpressionParser} from '../../Parsers/ExpressionParser';
import {DEFAULT_EXPRESSION_OPTIONS} from '../../constants';


export abstract class AbstractCompiler
{


	protected compileExpression(expression: string): string
	{
		return (new ExpressionParser(expression, DEFAULT_EXPRESSION_OPTIONS)).parse();
	}

}
