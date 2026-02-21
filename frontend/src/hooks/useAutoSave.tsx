import type { Note } from "@/types";
import type { AutoSaveStatus } from "@/types";
import { useCallback, useEffect, useState } from "react";
import useNotesAPI from "./UseNotesApi";

type UseAutoSaveProps = {
    note: Note | null;
    userEdited: boolean;
    // handleSaveNoteClick: () => void;
    setUserEdited: (userEdited: boolean) => void;
}


function useAutoSave({note, userEdited, setUserEdited}: UseAutoSaveProps) {
    const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>("initial"); 
    const {updateNote} = useNotesAPI();
    
     //Handle save
     const handleSaveNoteClick =useCallback(async ()=>{
        if(!note){
            return;
        }
        setAutoSaveStatus("saving");
        const success = await updateNote(note.id, {title: note.title, content: note.content});
        if(success){
           //use sonner to show success message
        //    toast.success("Note saved successfully");
           setUserEdited(false);
           setAutoSaveStatus("saved");
        }else{
            // toast.error("Failed to save note");
            console.error("Failed to save note");
            setAutoSaveStatus("unsaved");
        }
    }, [note, updateNote]);

    
     // Trigger auto save with debounce
     useEffect(()=>{
        if(!note || !userEdited){
            return;
        }
        const timeoutId = setTimeout(()=>{
            handleSaveNoteClick();
        }, 1000);

        return ()=>clearTimeout(timeoutId);
    },[note, userEdited]);

    return {autoSaveStatus, setAutoSaveStatus};
}
export default useAutoSave;