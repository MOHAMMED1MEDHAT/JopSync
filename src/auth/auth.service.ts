import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from './../prisma/prisma.service';
import { AuthDto } from './dtos';
import { ResponseObj } from './dtos/responseObj.dto';

@Injectable()
export class AuthService {
	constructor(
		private prismaService: PrismaService,
		private config: ConfigService,
		private jwt: JwtService,
	) {}
	async register(authDto: AuthDto): Promise<ResponseObj> {
		try {
			const hashedPassword = await this.prismaService.hashPassword(
				authDto.password,
			);

			const user = await this.prismaService.user.create({
				data: {
					email: authDto.email,
					hash: hashedPassword,
				},
			});

			delete user.hash;

			return { message: 'Registered Successfully', data: { user } };
		} catch (e) {
			if (
				e instanceof Prisma.PrismaClientKnownRequestError &&
				e.code === 'P2002'
			) {
				throw new BadRequestException('Email already exists');
			} else {
				throw new BadRequestException(e.message);
			}
		}
	}

	async login(authDto: AuthDto): Promise<ResponseObj> {
		const user = await this.prismaService.user.findUnique({
			where: {
				email: authDto.email,
			},
		});

		if (!user) throw new BadRequestException('user does not exist');

		const isPassValid = await this.prismaService.comparePassword(
			authDto.password,
			user.hash,
		);

		if (!isPassValid) throw new BadRequestException('Invalid Credentials');

		delete user.hash;

		return {
			message: 'LoggedIn Successfully',
			data: { user, token: (await this.generateAccessToken(user)).token },
		};
	}

	async logout(user: User): Promise<ResponseObj> {
		return {
			message: 'LoggedOut Successfully',
			data: { user },
		};
	}

	private async generateAccessToken(user: User): Promise<{ token: string }> {
		const payload = { email: user.email, sub: user.id };

		const token = await this.jwt.sign(payload, {
			secret: this.config.get('JWT_ACCESS_SECRET'),
			expiresIn: this.config.get('JWT_ACCESS_EXPIRATION_TIME'),
		});

		return { token };
	}
}
