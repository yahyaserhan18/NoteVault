import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';
import { Role } from '../../commen/enums/role.enum';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
    })
    password: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    lastName: string;

    @IsOptional()
    @IsString()
    @IsUrl()
    @MaxLength(2048)
    avatarUrl?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    bio?: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}