import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Role } from '../commen/enums/role.enum';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesRepository } from './notes.repository';

@Injectable()
export class NotesService {
    constructor(private readonly notesRepository: NotesRepository) {}

    async getAllNotes(userId: string): Promise<NoteResponseDto[]> {
        return this.notesRepository.getAllNotes(userId);
    }

    async createNote(
        createNoteDto: CreateNoteDto,
        userId: string,
    ): Promise<NoteResponseDto> {
        return this.notesRepository.createNote(createNoteDto, userId);
    }

    async findById(
        id: string,
        requestingUser: JwtPayload,
    ): Promise<NoteResponseDto> {
        const note = await this.notesRepository.findById(id);
        if (!note) {
            throw new NotFoundException('Note not found');
        }
        if (note.userId !== requestingUser.sub && requestingUser.role !== Role.ADMIN) {
            throw new ForbiddenException('Insufficient permissions');
        }
        return note;
    }

    async updateNote(
        id: string,
        updateNoteDto: UpdateNoteDto,
        requestingUser: JwtPayload,
    ): Promise<NoteResponseDto> {
        const note = await this.notesRepository.findById(id);
        if (!note) {
            throw new NotFoundException('Note not found');
        }
        if (note.userId !== requestingUser.sub && requestingUser.role !== Role.ADMIN) {
            throw new ForbiddenException('Insufficient permissions');
        }
        return this.notesRepository.updateNote(id, updateNoteDto) as Promise<NoteResponseDto>;
    }

    async deleteNote(
        id: string,
        requestingUser: JwtPayload,
    ): Promise<NoteResponseDto> {
        const note = await this.notesRepository.findById(id);
        if (!note) {
            throw new NotFoundException('Note not found');
        }
        if (note.userId !== requestingUser.sub && requestingUser.role !== Role.ADMIN) {
            throw new ForbiddenException('Insufficient permissions');
        }
        return this.notesRepository.deleteNote(id) as Promise<NoteResponseDto>;
    }
}
