import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user', description: 'Username of the user' })
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({ example: 'user@user.pl', description: 'Email address of the user' })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: 'user', description: 'Password of the user' })
  @IsNotEmpty()
  readonly password: string;
}
