import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	UseGuards,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { AuthService } from './auth.service';
import { ResponseObj } from './dto/responseObj.dto';
import { GetUser } from './decorator';
import { JwtAuthGuard } from './guard';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}
	@Post('register')
	async register(@Body() authDto: AuthDto): Promise<ResponseObj> {
		return await this.authService.register(authDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('login')
	async login(@Body() authDto: AuthDto): Promise<ResponseObj> {
		return await this.authService.login(authDto);
	}

	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtAuthGuard)
	@Post('logout')
	async logout(@GetUser() user: User): Promise<ResponseObj> {
		return await this.authService.logout(user);
	}
}
