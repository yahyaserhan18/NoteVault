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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesService } from './notes.service';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}


  //get all notes
  @Get()
  async getAllNotes(
    @CurrentUser() user: JwtPayload,
  ): Promise<NoteResponseDto[]> {
    return this.notesService.getAllNotes(user.sub);
  }

  @Post()
  async createNote(
    @Body() createNoteDto: CreateNoteDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<NoteResponseDto> {
    return this.notesService.createNote(createNoteDto, user.sub);
  }

  @Get(':id')
  async getNoteById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<NoteResponseDto> {
    return this.notesService.findById(id, user);
  }

  @Patch(':id')
  async updateNote(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<NoteResponseDto> {
    return this.notesService.updateNote(id, updateNoteDto, user);
  }

  @Delete(':id')
  async deleteNote(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<NoteResponseDto> {
    return this.notesService.deleteNote(id, user);
  }
}
