import { IsEnum, IsString } from 'class-validator';
import { JobStatus, JobType } from '../enums';

export class JobDto {
	@IsString()
	position: string;

	@IsString()
	company: string;

	@IsString()
	jobLocation: string;

	@IsEnum(JobType)
	jobType: JobType;

	@IsEnum(JobStatus)
	jobStatus: JobStatus;
}
