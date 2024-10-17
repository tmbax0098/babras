import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[+\d][\d\s().-]{6,20}$/, {
    message: 'Phone number must be a valid international number',
  })
  phone!: string;
}
