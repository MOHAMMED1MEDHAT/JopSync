import {
	Body,
	Controller,
	Get,
	ParseIntPipe,
	Post,
	Param,
	UseGuards,
} from '@nestjs/common';
import { ResponseObj } from '../auth/dto/responseObj.dto';
import { JobService } from './job.service';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
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
		@Param('id', ParseIntPipe) id: string,
	): Promise<ResponseObj> {
		return await this.jobService.getJobById(id);
	}

	@Post()
	async createJob(
		@Body() jobDto: JobDto,
		@GetUser() user: User,
	): Promise<ResponseObj> {
		return await this.jobService.createJob(jobDto, user.id);
	}
	// async updateJob(): Promise<ResponseObj> {}
	// async deleteJob(): Promise<ResponseObj> {}
}
