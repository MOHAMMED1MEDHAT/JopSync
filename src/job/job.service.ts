import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ResponseObj } from '../auth/dto/responseObj.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JobDto } from './dto/job.dto';
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

	async getJobById(jobId: string, userId: string): Promise<ResponseObj> {
		const job = await this.pirsmaService.job.findUnique({
			where: {
				id: jobId,
				userId,
			},
		});

		if (!job) throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);

		return { message: 'job found', data: { job } };
	}

	async createJob(jobDto: JobDto, userId: string): Promise<ResponseObj> {
		const { position, jobLocation, status, type, company } = jobDto;
		const statusMap = {
			DECLINED: $Enums.Status.DECLINED,
			INTERVIEW: $Enums.Status.INTERVIEW,
			PENDING: $Enums.Status.PENDING,
		};

		const typeMap = {
			FULL_TIME: $Enums.Type.FULLTIME,
			PART_TIME: $Enums.Type.PARTTIME,
			INTERNSHIP: $Enums.Type.INTERNSHIP,
			REMOTE: $Enums.Type.REMOTE,
		};

		const jobStatus = statusMap[status] || $Enums.Status.PENDING;
		const jobType = typeMap[type] || $Enums.Type.REMOTE;

		const job = await this.pirsmaService.job.create({
			data: {
				position,
				jobLocation,
				company,
				status: jobStatus,
				type: jobType,
				userId,
			},
		});

		return { message: 'job created successfully', data: { job } };
	}
}
