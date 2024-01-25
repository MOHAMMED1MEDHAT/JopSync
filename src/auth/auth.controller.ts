import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthDto } from './dto';
import { AuthService } from './auth.service';
import { ResponseObj } from './dto/responseObj.dto';

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

	async logout(): Promise<ResponseObj> {
		return null;
	}
}
