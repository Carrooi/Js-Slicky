export abstract class AbstractView
{


	public parent: AbstractView;

	public children: Array<AbstractView> = [];


	constructor(parent?: AbstractView)
	{
		if (parent) {
			this.parent = parent;
			this.parent.children.push(this);
		}
	}


	public detach(): void
	{
		for (let i = 0; i < this.children.length; i++) {
			this.children[i].detach();
		}
	}

}
