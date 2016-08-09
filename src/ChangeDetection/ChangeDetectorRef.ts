export class ChangeDetectorRef
{


	private onRefresh: () => void;


	constructor(onRefresh: () => void)
	{
		this.onRefresh = onRefresh;
	}


	public refresh(): void
	{
		this.onRefresh();
	}

}
