import {EventEmitter} from '../Util/EventEmitter';


export class ChildrenDirectivesQuery<T>
{


	public added = new EventEmitter<T>();

	public removed = new EventEmitter<T>();

	public updated = new EventEmitter<Array<T>>();


	public directives: Array<T> = [];


	public _add(directive: T): void
	{
		this.directives.push(directive);
		this.added.emit(directive);
		this.updated.emit(this.directives);
	}


	public _remove(directive: T): void
	{
		let i = this.directives.indexOf(directive);

		if (i >= 0) {
			this.directives.splice(i, 1);
			this.removed.emit(directive);
			this.updated.emit(this.directives);
		}
	}

}
