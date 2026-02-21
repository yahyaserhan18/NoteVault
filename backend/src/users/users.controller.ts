import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Role } from '../commen/enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async getAllUsers(): Promise<UserResponseDto[]> {
        return this.usersService.getAllUsers();
    }

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        return this.usersService.createUser(createUserDto);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getUserById(
        @Param('id') id: string,
        @CurrentUser() currentUser: JwtPayload,
    ): Promise<UserResponseDto | null> {
        return this.usersService.findById(currentUser, id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @CurrentUser() currentUser: JwtPayload,
    ): Promise<UserResponseDto | null> {
        return this.usersService.updateUser(currentUser, id, updateUserDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async deleteUser(@Param('id') id: string): Promise<UserResponseDto | null> {
        return this.usersService.deleteUser(id);
    }
}
