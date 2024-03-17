import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorators';
import { ResponseObj } from '../auth/dtos/responseObj.dto';
import { JwtAuthGuard } from '../auth/guards';
import { JobDto } from './dto/job.dto';
import { JobService } from './job.service';

@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobController {
	constructor(private jobService: JobService) {}

	@Get()
	async getAllUserJobs(@GetUser() user: User): Promise<ResponseObj> {
		return await this.jobService.getAllJobs(user.id);
	}

	@Get('/:id')
	async getJobById(
		@Param('id') id: string,
		@GetUser() user: User,
	): Promise<ResponseObj> {
		return await this.jobService.getJobById(id, user.id);
	}

	@Post()
	async createJob(
		@Body() jobDto: JobDto,
		@GetUser() user: User,
	): Promise<ResponseObj> {
		return await this.jobService.createJob(jobDto, user.id);
	}

	@Patch('/:id')
	async updateJob(
		@Param('id') id: string,
		@GetUser() user: User,
		@Body() jobDto: JobDto,
	): Promise<ResponseObj> {
		return await this.jobService.updateJob(id, user.id, jobDto);
	}

	@Delete('/:id')
	async deleteJob(
		@Param('id') id: string,
		@GetUser() user: User,
	): Promise<ResponseObj> {
		return await this.jobService.deleteJob(id, user.id);
	}
}
