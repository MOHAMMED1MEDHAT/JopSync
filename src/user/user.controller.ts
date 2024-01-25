import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { UserService } from './user.service';
import { UpdatePasswordDto, UpdateUserDto } from './dto';
import { JwtAuthGuard } from '../auth/guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

	@Get('me')
	getMe(@GetUser() user: User): User {
		return user;
	}

	@Patch('/me')
	async updateMe(
		@GetUser() user: User,
		@Body() updateUserDto: UpdateUserDto,
	): Promise<User> {
		return await this.userService.updateUserById(user.id, updateUserDto);
	}

	@Patch('/me/password')
	async updatePassword(
		@GetUser() user: User,
		@Body() updatePasswordDto: UpdatePasswordDto,
	): Promise<User> {
		return await this.userService.updatePassword(user.id, updatePasswordDto);
	}

	@Patch('/:id')
	async updateUserById(
		@Param('id', ParseIntPipe) id: string,
		@Body() updateUserDto: UpdateUserDto,
	): Promise<User> {
		return await this.userService.updateUserById(id, updateUserDto);
	}

	@Delete('/me')
	async deleteMe(@GetUser() user: User): Promise<User> {
		return await this.userService.deleteUserById(user.id);
	}
}
