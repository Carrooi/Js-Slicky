export class Realm
{


	private zone: Zone;

	private onEnter: () => void;

	private onLeave: () => void;


	constructor(parent?: Realm, onEnter?: () => void, onLeave?: () => void)
	{
		this.onEnter = onEnter;
		this.onLeave = onLeave;

		if (!Zone) {
			throw new Error('Slicky requires Zone.js polyfill.');
		}

		let parentZone = parent ? parent.zone : Zone.current;

		this.zone = parentZone.fork({
			name: 'slicky',
			onInvoke: (delegate: ZoneDelegate, current: Zone, target: Zone, callback: Function, applyThis: any, applyArgs: Array<any>, source: string): any => {
				try {
					if (this.onEnter && current === target) this.onEnter();
					return delegate.invoke(target, callback, applyThis, applyArgs, source);
				} finally {
					if (this.onLeave && current === target) this.onLeave();
				}
			},
			onInvokeTask: (delegate: ZoneDelegate, current: Zone, target: Zone, task: Task, applyThis: any, applyArgs: any): any => {
				try {
					if (this.onEnter && current === target) this.onEnter();
					return delegate.invokeTask(target, task, applyThis, applyArgs);
				} finally {
					if (this.onLeave && current === target) this.onLeave();
				}
			},
		});
	}


	public run(fn: () => any): any
	{
		return this.zone.run(fn);
	}

}
