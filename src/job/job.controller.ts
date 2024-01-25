import {
	Body,
	Controller,
	Get,
	Post,
	Param,
	UseGuards,
	Patch,
	Delete,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { ResponseObj } from '../auth/dto/responseObj.dto';
import { JobService } from './job.service';
import { GetUser } from '../auth/decorator';
import { JwtAuthGuard } from '../auth/guard';
import { JobDto } from './dto/job.dto';

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
