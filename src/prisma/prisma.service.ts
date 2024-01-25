import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

@Injectable()
export class PrismaService extends PrismaClient {
	constructor(config: ConfigService) {
		super({
			datasources: {
				db: {
					url: config.get('DATABASE_URL'),
				},
			},
		});
	}

	async hashPassword(password: string): Promise<string> {
		const hash = await argon.hash(password);

		return hash;
	}

	async comparePassword(password: string, hash: string): Promise<boolean> {
		return await argon.verify(hash, password);
	}

	async cleanDB(): Promise<any> {
		return this.$transaction([this.job.deleteMany(), this.user.deleteMany()]);
	}
}
