import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('app e2e', () => {
	let app: INestApplication;
	let prisma: PrismaService;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		await app
			.useGlobalPipes(
				new ValidationPipe({
					whitelist: true,
				}),
			)
			.init();
		const port = process.env.PORT || 3003;

		app.listen(port);
		prisma = app.get(PrismaService);

		await prisma.cleanDB();

		pactum.request.setBaseUrl(`http://localhost:${port}`);
	});

	afterAll(async () => {
		await app.close();
	});

	describe('Auth', () => {
		const userDto = {
			email: 'mohammedmedhat@gmail.com',
			password: '12345678',
		};

		describe('POST /auth/register (user)', () => {
			it('should FAIL to register because of the invalid body', () => {
				return pactum
					.spec()
					.post('/auth/register')
					.withBody({ email: userDto.email })
					.expectStatus(400);
			});

			it('should register', () => {
				return pactum
					.spec()
					.post('/auth/register')
					.withBody(userDto)
					.expectStatus(201);
			});

			it('should FAIL register because of the user already exists', () => {
				return pactum
					.spec()
					.post('/auth/register')
					.withBody(userDto)
					.expectStatus(400);
			});
		});

		describe('POST /auth/login (user)', () => {
			it('should FAIL to login because of the invalid body', () => {
				return pactum
					.spec()
					.post('/auth/login')
					.withBody({
						email: userDto.email,
					})
					.expectStatus(400);
			});

			it('should FAIL to login because of the incorrect password', () => {
				return pactum
					.spec()
					.post('/auth/login')
					.withBody({
						email: userDto.email,
						password: '12345',
					})
					.expectBody({
						message: 'Invalid Credentials',
						error: 'Bad Request',
						statusCode: 400,
					})
					.expectStatus(400);
			});
			it('should login', () => {
				return pactum
					.spec()
					.post('/auth/login')
					.withBody(userDto)
					.expectStatus(200)
					.stores('userAt', 'data.token')
					.stores('userId', 'data.user.id');
			});
		});
	});

	describe('Jobs', () => {
		describe('POST /jobs', () => {
			it('should create the job', () => {
				return pactum
					.spec()
					.post('/jobs')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.withBody({
						position: 'Software Engineer',
						company: 'Google',
						jobLocation: 'Cairo',
						status: 'PENDING',
						type: 'FULL_TIME',
					})
					.expectStatus(200)
					.inspect()
					.stores('jobId', 'data.job.id');
			});

			it('should FAIL create a job cause the user is not authenticated', () => {
				return pactum
					.spec()
					.post('/jobs')
					.withBody({
						position: 'Software Engineer',
						company: 'Google',
						jobLocation: 'Cairo',
						status: 'PENDING',
						type: 'FULL_TIME',
					})
					.expectStatus(401);
			});
		});

		describe('PATCH /jobs/:id', () => {
			it.skip("should FAIL update the user's info by it's id if the id does not exists", () => {
				return pactum
					.spec()
					.patch('/users/1')
					.withHeaders({
						Authorization: 'Bearer $S{adminAt}',
					})
					.withBody({
						email: 'mohammedmedhat2121@gmail.com',
						firstName: 'mohammed',
						lastName: 'medhat',
					})
					.expectStatus(406);
			});

			it.skip("should update the user's info by it's id and return the updated user info", () => {
				return pactum
					.spec()
					.patch('/users/$S{userId}')
					.withHeaders({
						Authorization: 'Bearer $S{adminAt}',
					})
					.withBody({
						email: 'mohammedmedhat2121@gmail.com',
						firstName: 'mohammed',
						lastName: 'medhat',
					})
					.expectStatus(200);
			});

			it.skip("should FAIL update the user's info by it's id if not admin", () => {
				return pactum
					.spec()
					.patch('/users/$S{userId}')
					.withBody({
						email: 'mohammedmedhat2121@gmail.com',
						firstName: 'mohammed',
						lastName: 'medhat',
					})
					.expectStatus(401);
				// .expectStatus(403);
			});
		});

		describe('GET /jobs', () => {
			it("should FAIL to return all user's jobs because he has no auth token", () => {
				return pactum.spec().get('/jobs').expectStatus(401);
			});

			it('should return no content', () => {
				return pactum
					.spec()
					.get('/jobs')
					.withBearerToken('$S{userAt}')
					.expectStatus(204);
			});
		});

		describe('GET /jobs/:id', () => {
			it.skip("should FAIL return the user's info by it's id if not admin", () => {
				return pactum
					.spec()
					.get('/jobs/1')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.expectStatus(403);
			});

			it.skip('should return not acceptable id', () => {
				return pactum
					.spec()
					.get('/jobs/1')
					.withHeaders({
						Authorization: 'Bearer $S{adminAt}',
					})
					.expectStatus(406);
			});

			it.skip("should return the user's info by it's id", () => {
				return pactum
					.spec()
					.get('/users/$S{userId}')
					.withHeaders({
						Authorization: 'Bearer $S{adminAt}',
					})
					.expectStatus(200);
			});

			describe('DELETE /users/:id', () => {
				it.skip("should FAIL delete the user's info by it's id if not admin", () => {
					return pactum
						.spec()
						.delete('/users/$S{userId}')
						.withHeaders({ Authorization: 'Bearer $S{uaserAt}' })
						.expectStatus(401);
					// .expectStatus(403);
				});

				it.skip("should delete the user's info by it's id and return the deleted user info if admin", () => {
					return pactum
						.spec()
						.delete('/users/$S{userId}')
						.withHeaders({ Authorization: 'Bearer $S{adminAt}' })
						.expectStatus(200);
				});
			});

			describe('DELETE /users/me', () => {
				it.skip("should FAIL delete the user's info if user is not authenticated", () => {
					return pactum.spec().delete('/users/me').expectStatus(401);
				});

				it.skip("should delete the user's info if user is authenticated", () => {
					return pactum
						.spec()
						.delete('/users/me')
						.withHeaders({ Authorization: 'Bearer $S{adminAt}' })
						.expectStatus(200);
				});
			});
		});

		describe('GET /users/me', () => {
			it.skip('should return the user profile', () => {
				return pactum
					.spec()
					.get('/users/me')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.expectStatus(200);
			});

			it.skip('should FAIL return the user profile if not authenticated', () => {
				return pactum.spec().get('/users/me').expectStatus(401);
			});
		});
	});

	describe('User', () => {
		describe('GET /users', () => {
			it.skip('should fail to return all users', () => {
				return pactum
					.spec()
					.get('/users')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.expectStatus(403);
			});

			it.skip('should return all users if admin', () => {
				return pactum
					.spec()
					.get('/users')
					.withHeaders({
						Authorization: 'Bearer $S{adminAt}',
					})
					.expectStatus(200);
			});
		});

		describe('GET /users/:id', () => {
			it.skip("should FAIL return the user's info by it's id if not admin", () => {
				return pactum
					.spec()
					.get('/users/1')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.expectStatus(403);
			});

			it.skip('should return not acceptable id', () => {
				return pactum
					.spec()
					.get('/users/1')
					.withHeaders({
						Authorization: 'Bearer $S{adminAt}',
					})
					.expectStatus(406);
			});

			it.skip("should return the user's info by it's id", () => {
				return pactum
					.spec()
					.get('/users/$S{userId}')
					.withHeaders({
						Authorization: 'Bearer $S{adminAt}',
					})
					.expectStatus(200);
			});
		});

		describe('GET /users/me', () => {
			it.skip('should return the user profile', () => {
				return pactum
					.spec()
					.get('/users/me')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.expectStatus(200);
			});

			it.skip('should FAIL return the user profile if not authenticated', () => {
				return pactum.spec().get('/users/me').expectStatus(401);
			});
		});

		describe('PATCH /users/me/password', () => {
			it.skip("should update the user's password by if authenticated", () => {
				return pactum
					.spec()
					.patch('/users/me/password')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.withBody({
						oldPassword: '12345678',
						newPassword: '123456789',
					})
					.expectStatus(200);
			});

			it.skip("should FAIL update the user's password if not authenticated", () => {
				return pactum
					.spec()
					.patch('/users/me/password')
					.withBody({
						oldPassword: '12345678',
						newPassword: '123456789',
					})
					.expectStatus(401);
			});
		});

		describe('PATCH /users/me', () => {
			it.skip("should FAIL update the user's info if not authenticated", () => {
				return pactum
					.spec()
					.patch('/users/me')
					.withBody({
						email: 'mohammedmedhat2121@gmail.com',
						firstName: 'mohammed',
						lastName: 'medhat',
					})
					.expectStatus(401);
			});

			it.skip("should update the user's info by if authenticated", () => {
				return pactum
					.spec()
					.patch('/users/me')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.withBody({
						email: 'mohammedmedhat2121@gmail.com',
						firstName: 'mohammed',
						lastName: 'medhat',
					})
					.expectStatus(200);
			});
		});

		describe('PATCH /users/:id', () => {
			it.skip("should FAIL update the user's info by it's id if the id does not exists", () => {
				return pactum
					.spec()
					.patch('/users/1')
					.withHeaders({
						Authorization: 'Bearer $S{adminAt}',
					})
					.withBody({
						email: 'mohammedmedhat2121@gmail.com',
						firstName: 'mohammed',
						lastName: 'medhat',
					})
					.expectStatus(406);
			});

			it.skip("should update the user's info by it's id and return the updated user info", () => {
				return pactum
					.spec()
					.patch('/users/$S{userId}')
					.withHeaders({
						Authorization: 'Bearer $S{adminAt}',
					})
					.withBody({
						email: 'mohammedmedhat2121@gmail.com',
						firstName: 'mohammed',
						lastName: 'medhat',
					})
					.expectStatus(200);
			});

			it.skip("should FAIL update the user's info by it's id if not admin", () => {
				return pactum
					.spec()
					.patch('/users/$S{userId}')
					.withBody({
						email: 'mohammedmedhat2121@gmail.com',
						firstName: 'mohammed',
						lastName: 'medhat',
					})
					.expectStatus(401);
				// .expectStatus(403);
			});
		});

		describe('DELETE /users/:id', () => {
			it.skip("should FAIL delete the user's info by it's id if not admin", () => {
				return pactum
					.spec()
					.delete('/users/$S{userId}')
					.withHeaders({ Authorization: 'Bearer $S{uaserAt}' })
					.expectStatus(401);
				// .expectStatus(403);
			});

			it.skip("should delete the user's info by it's id and return the deleted user info if admin", () => {
				return pactum
					.spec()
					.delete('/users/$S{userId}')
					.withHeaders({ Authorization: 'Bearer $S{adminAt}' })
					.expectStatus(200);
			});
		});

		describe('DELETE /users/me', () => {
			it.skip("should FAIL delete the user's info if user is not authenticated", () => {
				return pactum.spec().delete('/users/me').expectStatus(401);
			});

			it.skip("should delete the user's info if user is authenticated", () => {
				return pactum
					.spec()
					.delete('/users/me')
					.withHeaders({ Authorization: 'Bearer $S{adminAt}' })
					.expectStatus(200);
			});
		});
	});
});
