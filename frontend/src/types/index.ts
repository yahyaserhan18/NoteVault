type Note = {
    id: string;
    userId: string;
    title: string;
    content: string;
    summary: string | null;
    createdAt: Date;
    updatedAt: Date;
}

type CreateNoteDto = {
    title: string;
    content: string;
}

//update dto
type UpdateNoteDto = {
    title?: string;
    content?: string;
    summary?: string;
}


type AutoSaveStatus = "initial" | "saving" | "saved" | "unsaved";

export type { Note, CreateNoteDto, UpdateNoteDto, AutoSaveStatus };