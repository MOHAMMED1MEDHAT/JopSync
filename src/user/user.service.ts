import {
	HttpException,
	Injectable,
	NotAcceptableException,
	HttpStatus,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { User } from '@prisma/client';
import { UpdatePasswordDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
	constructor(private prismaService: PrismaService) {}

	async updateUserById(
		id: string,
		updateUserDto: UpdateUserDto,
	): Promise<User> {
		const user = await this.prismaService.user.findUnique({
			where: { id },
		});

		if (!user) throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);

		const updatedUser = await this.prismaService.user.update({
			where: { id },
			data: { ...updateUserDto },
		});

		delete updatedUser.hash;

		return updatedUser;
	}

	async updatePassword(
		id: string,
		UpdatePasswordDto: UpdatePasswordDto,
	): Promise<User> {
		const user = await this.prismaService.user.findUnique({
			where: { id },
		});

		if (
			!(await this.prismaService.comparePassword(
				UpdatePasswordDto.oldPassword,
				user.hash,
			))
		)
			throw new NotAcceptableException('Old password is incorrect');

		if (UpdatePasswordDto.newPassword === UpdatePasswordDto.oldPassword)
			throw new NotAcceptableException(
				'New password and old password are the same',
			);

		const hashedPassword = await this.prismaService.hashPassword(
			UpdatePasswordDto.newPassword,
		);

		const updatedUser = await this.prismaService.user.update({
			where: { id },
			data: { hash: hashedPassword },
		});

		delete updatedUser.hash;

		return updatedUser;
	}

	async deleteUserById(id: string): Promise<User> {
		return await this.prismaService.user.delete({ where: { id } });
	}
}
