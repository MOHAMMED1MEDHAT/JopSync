import { IsString } from 'class-validator';

export class JobDto {
	@IsString()
	position: string;

	@IsString()
	company: string;

	@IsString()
	jobLocation: string;

	@IsString()
	type: string;

	@IsString()
	status: string;
}
