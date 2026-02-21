
import { GlassCard } from "@/components/common/GlassCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useNotesAPI from "@/hooks/UseNotesApi";
import type { Note } from "@/types";
import { PlusIcon, SearchIcon } from "lucide-react"
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";


export function HomePage() {
  const {getAllNotes, createNote} = useNotesAPI();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(()=>{
    const fetchNotes = async ()=>{
      const notes = await getAllNotes();
      setNotes(notes);
    }
    fetchNotes();
  },[]);

  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) {
      return notes;
    }
    const lowerSearch = searchTerm.toLowerCase();
    return notes.filter((note) => 
      note.title.toLowerCase().includes(lowerSearch)
    );
  }, [notes, searchTerm]);

  const handleCreateNote = async ()=>{
    const newNote = await createNote({title: "New Note", content: "-"});
    if(newNote){
      navigate(`/notes/${newNote.id}`);
    }
    else{
      console.error("Failed to create note");
    }
  }

  const handleNoteClick = (id: string)=>{
    navigate(`/notes/${id}`);
  }


  return (
    <div className="space-y-12">
      {/* Hero card */}
      <GlassCard className="flex flex-col px-4 py-6 gap-4">
        {/* Header of the card */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">My Notes</h1>
          <Button onClick={handleCreateNote} className="cursor-pointer"><PlusIcon /> Create Note</Button>
        </div>


        {/* Search input using shadcn/ui input*/}
        <div className="relative">
        <SearchIcon className="absolute left-2 top-1.5 text-muted-foreground h-5 w-5" />
        <Input 
          type="text" 
          placeholder="Search notes" 
          className="w-full p-4 pl-9" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        </div>

        {/* Notes list */}
       <div className="flex flex-col gap-4 mt-4">
          {filteredNotes.map((note)=>(
            <GlassCard onClick={()=>handleNoteClick(note.id)} key={note.id} className="cursor-pointer hover:bg-gray-100 p-4 transition-all duration-300">
              <h2>{note.title}</h2>
            </GlassCard>
          ))}
       </div>
       
      </GlassCard>

    </div>
  )
}
