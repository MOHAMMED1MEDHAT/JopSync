import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PrismaService } from './../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly configService: ConfigService,
		private prismaService: PrismaService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get('JWT_ACCESS_SECRET'),
		});
	}

	async validate(payload: { sub: string; email: string }): Promise<User> {
		const user = await this.prismaService.user.findUnique({
			where: {
				email: payload.email,
			},
		});

		if (!user) {
			return null;
		}

		delete user.hash;

		return user;
	}
}
