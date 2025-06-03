import { IsString } from 'class-validator';

export class SendEmailDto {
  @IsString()
  target: string;

  @IsString()
  content: string;

  @IsString()
  subject: string;
}
