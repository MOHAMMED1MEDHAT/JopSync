import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ResponseObj } from '../auth/dto/responseObj.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JobDto } from './dto/job.dto';
import { JobStatus, JobType } from './enums';
import { $Enums } from '@prisma/client';

@Injectable()
export class JobService {
	constructor(private pirsmaService: PrismaService) {}
	async getAllJobs(userId?: string): Promise<ResponseObj> {
		const jobs = await this.pirsmaService.job.findMany({
			where: {
				userId,
			},
		});

		if (!jobs.length)
			throw new HttpException('NO CONTENT', HttpStatus.NO_CONTENT);

		return { message: 'all jobs', data: { jobs } };
	}

	async getJobById(jobId: string): Promise<ResponseObj> {
		const job = await this.pirsmaService.job.findUnique({
			where: {
				id: jobId,
			},
		});

		if (!job) throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);

		return { message: 'job found', data: { job } };
	}

	async createJob(jobDto: JobDto, userId: string): Promise<ResponseObj> {
		const { position, jobLocation, jobStatus, jobType, company } = jobDto;

		const statusMap = {
			[JobStatus.DECLINED]: $Enums.Status.DECLINED,
			[JobStatus.INTERVIEW]: $Enums.Status.INTERVIEW,
			[JobStatus.PENDING]: $Enums.Status.PENDING,
		};

		const jobTypeMap = {
			[JobType.REMOTE]: $Enums.Type.REMOTE,
			[JobType.INTERNSHIP]: $Enums.Type.INTERNSHIP,
			[JobType.FULL_TIME]: $Enums.Type.FULLTIME,
			[JobType.PART_TIME]: $Enums.Type.PARTTIME,
		};

		const type = jobTypeMap[jobType];
		const status = statusMap[jobStatus];

		const job = await this.pirsmaService.job.create({
			data: {
				position,
				jobLocation,
				company,
				status,
				type,
				userId,
			},
		});

		return { message: 'job created successfully', data: { job } };
	}
}
