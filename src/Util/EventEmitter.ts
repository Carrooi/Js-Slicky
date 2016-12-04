import {Subject} from 'rxjs/Subject';


export class EventEmitter<T> extends Subject<T>
{


	public emit(value?: T): void
	{
		super.next(value);
	}

}
