import { IsEmail, IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    name?: string;
}