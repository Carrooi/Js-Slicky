import {Container, Injectable, Inject} from '../../../di';

import chai = require('chai');


let expect = chai.expect;


describe('#DI/Container', () => {

	describe('provide()', () => {

		it('should return self', () => {
			let container = new Container;
			let container2 = new Container;

			expect(container.get(Container)).to.be.equal(container);
			expect(container.get(Container)).to.not.be.equal(container2);
		});

		it('should provide service', () => {
			@Injectable()
			class Test {}

			let container = new Container;

			container.provide(Test);

			expect(container.get(Test)).to.be.an.instanceOf(Test);
		});

		it('should provide service from factory', () => {
			@Injectable()
			class Test {}

			let container = new Container;
			let called = 0;

			container.provide(Test, {
				useFactory: () => {
					called++;
					return new Test;
				}
			});

			let test = container.get(Test);

			expect(test).to.be.an.instanceOf(Test);
			expect(test).to.be.equal(container.get(Test));

			expect(called).to.be.equal(1);
		});

		it('should provide more services', () => {
			@Injectable()
			class Test1 {}

			@Injectable()
			class Test2 {}

			let container = new Container;

			container.provide([
				Test1,
				Test2,
			]);

			expect(container.get(Test1)).to.be.an.instanceOf(Test1);
			expect(container.get(Test2)).to.be.an.instanceOf(Test2);
		});

		it('should provide more services with options', () => {
			@Injectable()
			class Test1 {}

			@Injectable()
			class Test2 {}

			let container = new Container;
			let called = 0;

			container.provide([
				[Test1, {
					useFactory: () => {
						called++;
						return new Test1;
					},
				}],
				[Test2, {
					useFactory: () => {
						called++;
						return new Test2;
					},
				}],
			]);

			expect(container.get(Test1)).to.be.an.instanceOf(Test1);
			expect(container.get(Test2)).to.be.an.instanceOf(Test2);

			expect(called).to.be.equal(2);
		});

		it('should throw an error if service is without @Injectable annotation', () => {
			class Test {}

			let container = new Container;

			expect(() => {
				container.provide(Test);
			}).to.throw(Error, 'Can not register Test service into DI container without @Injectable() annotation.');
		});

		it('should not throw an error about missing @Injectable for services with useFactory option', () => {
			class Test1 {}

			let container = new Container;

			container.provide(Test1, {
				useFactory: () => {
					return new Test1;
				}
			});

			expect(container.get(Test1)).to.be.an.instanceOf(Test1);
		});

	});

	describe('get()', () => {

		it('should throw an error for not registered service', () => {
			@Injectable()
			class Test {}

			let container = new Container;

			expect(() => {
				container.get(Test);
			}).to.throw(Error, 'Service Test is not registered in DI container.');
		});

	});

	describe('create()', () => {

		it('should autowire all services', () => {
			@Injectable()
			class Test3 {}

			@Injectable()
			class Test2 {
				constructor(public test3: Test3) {}
			}

			@Injectable()
			class Test1 {
				constructor(public test2: Test2, public test3: Test3) {}
			}

			let container = new Container;

			container.provide(Test1);
			container.provide(Test2);
			container.provide(Test3);

			let test = <Test1>container.create(Test1);

			expect(test).to.be.an.instanceOf(Test1);
			expect(test.test2).to.be.an.instanceOf(Test2);
			expect(test.test3).to.be.an.instanceOf(Test3);
			expect(test.test2.test3).to.be.an.instanceOf(Test3);
			expect(test.test3).to.be.equal(test.test2.test3);
		});

		it('should throw an error for not existing service while autowiring', () => {
			class Test2 {}

			class Test1 {
				constructor(@Inject() test2: Test2) {}
			}

			let container = new Container;

			expect(() => {
				container.create(Test1);
			}).to.throw(Error, 'Service Test2 is not registered in DI container.');
		});

		it('should provide custom service', () => {
			class Test3 {}

			@Injectable()
			class Test2 {}

			@Injectable()
			class Test1 {
				constructor(public test2: Test2, public test3: Test3) {}
			}

			let container = new Container;
			let called = false;

			container.provide(Test1);
			container.provide(Test2);

			let test = <Test1>container.create(Test1, [
				{
					service: Test3,
					options: {
						useFactory: () => {
							called = true;
							return new Test3;
						},
					},
				},
			]);

			expect(called).to.be.equal(true);
			expect(test).to.be.an.instanceOf(Test1);
			expect(test.test2).to.be.an.instanceOf(Test2);
			expect(test.test3).to.be.an.instanceOf(Test3);
		});

		it('should overwrite registered service with custom', () => {
			@Injectable()
			class Test3 {
				custom = false;
			}

			@Injectable()
			class Test2 {}

			@Injectable()
			class Test1 {
				constructor(public test2: Test2, public test3: Test3) {}
			}

			let container = new Container;
			let called = false;

			container.provide(Test1);
			container.provide(Test2);
			container.provide(Test3);

			let test = <Test1>container.create(Test1, [
				{
					service: Test3,
					options: {
						useFactory: () => {
							called = true;

							let instance = new Test3;
							instance.custom = true;

							return instance;
						},
					},
				},
			]);

			expect(called).to.be.equal(true);
			expect(test).to.be.an.instanceOf(Test1);
			expect(test.test2).to.be.an.instanceOf(Test2);
			expect(test.test3).to.be.an.instanceOf(Test3);
			expect(test.test3.custom).to.be.equal(true);
		});

	});

});
