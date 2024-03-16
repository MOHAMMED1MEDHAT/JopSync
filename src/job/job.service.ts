import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { ResponseObj } from '../auth/dtos/responseObj.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JobDto } from './dto/job.dto';

@Injectable()
export class JobService {
	private readonly statusMap: Record<string, $Enums.Status>;
	private readonly typeMap: Record<string, $Enums.Type>;
	constructor(private pirsmaService: PrismaService) {
		this.statusMap = {
			DECLINED: $Enums.Status.DECLINED,
			INTERVIEW: $Enums.Status.INTERVIEW,
			PENDING: $Enums.Status.PENDING,
		};

		this.typeMap = {
			FULL_TIME: $Enums.Type.FULLTIME,
			PART_TIME: $Enums.Type.PARTTIME,
			INTERNSHIP: $Enums.Type.INTERNSHIP,
			REMOTE: $Enums.Type.REMOTE,
		};
	}

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

		const jobStatus = this.statusMap[status] || $Enums.Status.PENDING;
		const jobType = this.typeMap[type] || $Enums.Type.REMOTE;

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

	async updateJob(jobId: string, userId: string, jobDto): Promise<ResponseObj> {
		const isJob = await this.pirsmaService.job.findUnique({
			where: {
				id: jobId,
				userId,
			},
		});

		if (!isJob) throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);

		const { position, jobLocation, status, type, company } = jobDto;

		const jobStatus = this.statusMap[status] || $Enums.Status.PENDING;
		const jobType = this.typeMap[type] || $Enums.Type.REMOTE;

		const job = await this.pirsmaService.job.update({
			where: {
				id: jobId,
				userId,
			},
			data: {
				position,
				jobLocation,
				company,
				status: jobStatus,
				type: jobType,
			},
		});

		return { message: 'job updated successfully', data: { job } };
	}

	async deleteJob(jobId: string, userId: string): Promise<ResponseObj> {
		const isJob = await this.pirsmaService.job.findUnique({
			where: {
				id: jobId,
				userId,
			},
		});

		if (!isJob) throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);

		const job = await this.pirsmaService.job.delete({
			where: {
				id: jobId,
				userId,
			},
		});

		return { message: 'job deleted successfully', data: { job } };
	}
}
