import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
// import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea.tsx";
import useNotesAPI from "@/hooks/UseNotesApi";
import type { Note } from "@/types";
import { ArrowLeftIcon, LoaderCircleIcon } from "lucide-react";
import {useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DeleteDialog } from "@/components/common/DeleteDialog";
import AutoSaveIndicator from "@/components/note/AutoSaveIndecator";
import useAutoSave from "@/hooks/useAutoSave";


function NoteDetailPage() {
    const {id} = useParams();
    const {getNoteById, deleteNote} = useNotesAPI();
    const [note, setNote] = useState<Note | null>(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [userEdited, setUserEdited] = useState(false);

    const {autoSaveStatus, setAutoSaveStatus} = useAutoSave({note, userEdited, setUserEdited});


    useEffect(()=>{
        if(!id){
            return;
        }
        const fetchNote = async ()=>{
            const note = await getNoteById(id);
            if(note){
                    setNote(note);
                    setIsLoading(false);
            }
        }
        fetchNote();
    },[getNoteById,id]);


    //Hanglers
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        setNote(prev => prev?({...prev, title: e.target.value}):null);
        setUserEdited(true);
        setAutoSaveStatus("unsaved");
    };
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>)=>{
        setNote(prev => prev?({...prev, content: e.target.value}):null);
        setUserEdited(true);
        setAutoSaveStatus("unsaved");
    };

    const handleBackToAllNotes = ()=>{
        navigate(-1);
    }       

    const handleDeleteNoteClick = async ()=>{
        if(!note){
            return;
        }
        //confirm delete with alert-dialog
        const success = await deleteNote(note.id);
                if(success){
                    toast.success("Note deleted successfully");
                    navigate(-1);
                }
                else{
                    toast.error("Failed to delete note");
                    console.error("Failed to delete note");
                }
         
    }




    if(!note){
        return isLoading?<div className="flex items-center gap-2 justify-center h-full"><LoaderCircleIcon className="animate-spin" /> Loading note...</div>:<div>Note not found</div>;
    }
    return (
           <GlassCard className="flex flex-col gap-4 p-4">
            {/* Header Section */}
                <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="cursor-pointer"
                            onClick={handleBackToAllNotes}>
                            <ArrowLeftIcon />Back
                        </Button>

                        {/* Auto saving */}
                        <AutoSaveIndicator autoSaveStatus={autoSaveStatus} />
                    </div>
                    
                    {/* <Button variant="destructive" className="cursor-pointer"
                        onClick={handleDeleteNoteClick}>
                    <TrashIcon />Delete</Button> */}
                    <DeleteDialog onClick={handleDeleteNoteClick} buttonText="Delete" dialogTitle="Delete Note?" dialogDescription="This will permanently delete this note." />
                </div>
                {/* Ai tools buttons Section */}
                {/* <div className="flex gap-2">
                    <Button variant="outline" className="cursor-pointer"><SquareIcon />Summarize</Button>
                    <Button variant="outline" className="cursor-pointer"><RotateCcwIcon />Select Rewrite Mode</Button>    
                    <Button variant="outline" className="cursor-pointer"><Languages />  Translate</Button>
                </div> */}

                {/* Title Section */}
                <div>
                    {/* <Label>Title</Label> */}
                    <label htmlFor="title">Title</label>
                    <Input id="title" type="text" value={note.title} onChange={handleTitleChange} placeholder="Title"
                     className="mt-2" />
                </div>
                {/* Content Section */}
                <div>
                    <label htmlFor="content">Content</label>
                    <Textarea rows={20} id="content" value={note.content} onChange={handleContentChange} placeholder="Content"
                     className="mt-2 min-h-[200px]" />
                </div>


                {/* save note button */}
                {/* <div className="flex justify-center">
                    <Button variant="default" className="cursor-pointer "
                    disabled={!userEdited}
                        onClick={handleSaveNoteClick}>
                        <SaveIcon />Save Note
                    </Button>
                </div> */}
           </GlassCard>

  );
}

export default NoteDetailPage;