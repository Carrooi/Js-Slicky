# Dependency injection

All [directives](./directives.md) are created by slicky's dependency injection 
system. If you need to use service (model, etc) you should ask for it in 
constructor. You shouldn't care how to obtain access to some service, let 
someone else take care of it ;-)

## Services

`Users.ts`:

```ts
import {Injectable} from 'slicky/di';

@Injectable()
export class Users
{

	public getUsers(fn: (users: Array<any>) => void): void
	{
		// ...
	}

}
```

`bootstrap.ts`:

```ts
// ...

import {Users} from './app/Users';

let container = new Container;

container.provide(Users);

// ...
```

`UserComponent.ts`:

```ts
import {Component} from 'slicky/core';
import {Users} from '../../Users';

@Component({
	selector: 'user',
})
export class UserComponent
{
	
	private users: Users;
	
	constructor(users: Users)
	{
		this.users = users;
	}
	
}
```

## Factories

```ts
container.provide(Users, {
	useFactory: () => {
		return new Users;
	}
});
```

Services registered via `useFactory` option doesn't need to have `@Injectable()` 
annotation, so you can use this option to register libraries which are not 
compatible with slicky.
