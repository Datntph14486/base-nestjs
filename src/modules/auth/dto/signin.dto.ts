import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AuthSignInDto {
  @IsNotEmpty()
  @IsString()
  @Length(4, 30)
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(4, 30)
  password: string;
}
