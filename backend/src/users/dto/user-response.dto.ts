import { Role } from '../../commen/enums/role.enum';

export class UserResponseDto {
    id: string;
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    bio: string | null;
    createdAt: Date;
    updatedAt: Date;
}