import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../commen/enums/role.enum';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

const userResponseSelect = {
    id: true,
    email: true,
    role: true,
    firstName: true,
    lastName: true,
    avatarUrl: true,
    bio: true,
    createdAt: true,
    updatedAt: true,
} as const;

@Injectable()
export class UsersRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        return this.prisma.user.create({
            data: {
                email: createUserDto.email,
                passwordHash: hashedPassword,
                role: createUserDto.role ?? Role.USER,
                firstName: createUserDto.firstName,
                lastName: createUserDto.lastName,
                avatarUrl: createUserDto.avatarUrl ?? null,
                bio: createUserDto.bio ?? null,
            },
            select: userResponseSelect,
        });
    }

    async findById(id: string): Promise<UserResponseDto | null> {
        return this.prisma.user.findUnique({
            where: { id },
            select: userResponseSelect,
        });
    }

    async findByEmailWithPassword(
        email: string,
    ): Promise<{ id: string; email: string; passwordHash: string; role: Role } | null> {
        return this.prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, passwordHash: true, role: true },
        });
    }

    async deleteUser(id: string): Promise<UserResponseDto | null> {
        return this.prisma.user.delete({
            where: { id },
            select: userResponseSelect,
        });
    }
    async getAllUsers(): Promise<UserResponseDto[]> {
        return this.prisma.user.findMany({
            select: userResponseSelect,
        });
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto | null> {
        //check if at least one field is provided
        if (!updateUserDto.firstName && !updateUserDto.lastName && updateUserDto.avatarUrl === undefined && updateUserDto.bio === undefined) {
            throw new BadRequestException('At least one field must be provided');
          }
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) return null;
        return this.prisma.user.update({
            where: { id },
            data: {
                ...(updateUserDto.firstName !== undefined && { firstName: updateUserDto.firstName }),
                ...(updateUserDto.lastName !== undefined && { lastName: updateUserDto.lastName }),
                ...(updateUserDto.avatarUrl !== undefined && { avatarUrl: updateUserDto.avatarUrl ?? null }),
                ...(updateUserDto.bio !== undefined && { bio: updateUserDto.bio ?? null }),
                ...(updateUserDto.role !== undefined && { role: updateUserDto.role }),
            },
            select: userResponseSelect,
        });
    }
}