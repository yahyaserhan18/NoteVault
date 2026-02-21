import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    lastName?: string;

    @IsOptional()
    @IsString()
    @IsUrl({ require_tld: false })
    @MaxLength(2048)
    avatarUrl?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    bio?: string | null;
}
