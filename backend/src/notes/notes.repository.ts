import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteResponseDto } from './dto/note-response.dto';
const noteResponseSelect = {
    id: true,
    title: true,
    content: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
} as const;

@Injectable()
export class NotesRepository {
    constructor(private readonly prisma: PrismaService) {}

    async getAllNotes(userId: string): Promise<NoteResponseDto[]> {
        return this.prisma.note.findMany({
            where: { userId },
            select: noteResponseSelect,
        });
    }

    async createNote(
        createNoteDto: CreateNoteDto,
        userId: string,
    ): Promise<NoteResponseDto> {
        return this.prisma.note.create({
            data: {
                title: createNoteDto.title,
                content: createNoteDto.content,
                userId,
            },
            select: noteResponseSelect,
        });
    }

    async findById(id: string): Promise<NoteResponseDto | null> {
        return this.prisma.note.findUnique({
            where: { id },
            select: noteResponseSelect,
        });
    }

    async deleteNote(id: string): Promise<NoteResponseDto | null> {
        return this.prisma.note.delete({
            where: { id },
            select: noteResponseSelect,
        });
    }

    async updateNote(id: string, updateNoteDto: UpdateNoteDto): Promise<NoteResponseDto | null> {
        if (!updateNoteDto.title && !updateNoteDto.content) {
            throw new BadRequestException('At least one field must be provided');
        }
        const note = await this.prisma.note.findUnique({ where: { id } });
        if (!note) return null;
        return this.prisma.note.update({
            where: { id },
            data: {
                ...(updateNoteDto.title !== undefined && { title: updateNoteDto.title }),
                ...(updateNoteDto.content !== undefined && { content: updateNoteDto.content }),
            },
            select: noteResponseSelect,
        });
    }
}
