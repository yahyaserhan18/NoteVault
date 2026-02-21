import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '../commen/enums/role.enum';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}

    async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        return this.usersRepository.createUser(createUserDto);
    }

    async findById(
        requestingUser: JwtPayload,
        targetId: string,
    ): Promise<UserResponseDto | null> {
        if (requestingUser.sub !== targetId && requestingUser.role !== Role.ADMIN) {
            throw new ForbiddenException('Insufficient permissions');
        }
        return this.usersRepository.findById(targetId);
    }

    async deleteUser(id: string): Promise<UserResponseDto | null> {
        return this.usersRepository.deleteUser(id);
    }

    async getAllUsers(): Promise<UserResponseDto[]> {
        return this.usersRepository.getAllUsers();
    }

    async updateUser(
        requestingUser: JwtPayload,
        targetId: string,
        updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto | null> {
        if (requestingUser.sub !== targetId && requestingUser.role !== Role.ADMIN) {
            throw new ForbiddenException('Insufficient permissions');
        }
        if (updateUserDto.role !== undefined && requestingUser.role !== Role.ADMIN) {
            delete updateUserDto.role;
        }
        return this.usersRepository.updateUser(targetId, updateUserDto);
    }
}
