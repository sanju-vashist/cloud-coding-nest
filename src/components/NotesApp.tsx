
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash, Edit, Save, Search, StickyNote, Download, Upload } from 'lucide-react';

interface NotesAppProps {
  userId: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const NotesApp: React.FC<NotesAppProps> = ({ userId }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem(`webOS_notes_${userId}`);
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: ''
  });
  
  useEffect(() => {
    localStorage.setItem(`webOS_notes_${userId}`, JSON.stringify(notes));
  }, [notes, userId]);
  
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleCreateNote = () => {
    if (!newNote.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note",
        variant: "destructive"
      });
      return;
    }
    
    const now = new Date().toISOString();
    const note: Note = {
      id: `note-${Date.now()}`,
      title: newNote.title,
      content: newNote.content,
      createdAt: now,
      updatedAt: now
    };
    
    setNotes([note, ...notes]);
    setIsCreateDialogOpen(false);
    setNewNote({
      title: '',
      content: ''
    });
    
    toast({
      title: "Note created",
      description: "Your note has been created successfully"
    });
  };
  
  const handleUpdateNote = () => {
    if (!selectedNote) return;
    
    const updatedNotes = notes.map(note => 
      note.id === selectedNote.id 
        ? { ...selectedNote, updatedAt: new Date().toISOString() } 
        : note
    );
    
    setNotes(updatedNotes);
    setIsEditMode(false);
    
    toast({
      title: "Note updated",
      description: "Your note has been updated successfully"
    });
  };
  
  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    setSelectedNote(null);
    
    toast({
      title: "Note deleted",
      description: "Your note has been deleted successfully"
    });
  };
  
  const exportNotes = () => {
    try {
      const dataStr = JSON.stringify(notes, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `webos-notes-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Notes exported",
        description: "Your notes have been exported successfully"
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your notes",
        variant: "destructive"
      });
    }
  };
  
  const importNotes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedNotes = JSON.parse(event.target?.result as string);
        
        if (Array.isArray(importedNotes) && importedNotes.every(note => 
          typeof note.id === 'string' && 
          typeof note.title === 'string' && 
          typeof note.content === 'string' &&
          typeof note.createdAt === 'string' &&
          typeof note.updatedAt === 'string'
        )) {
          setNotes(importedNotes);
          toast({
            title: "Notes imported",
            description: `Imported ${importedNotes.length} notes successfully`
          });
        } else {
          throw new Error('Invalid format');
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The selected file is not a valid notes backup",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
    e.target.value = ''; // Reset the input
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };
  
  return (
    <div className="flex flex-col h-full p-4 bg-gray-50 dark:bg-gray-900">
      {/* Notes Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Notes</h2>
        <div className="flex space-x-2">
          <input 
            type="file" 
            id="import-notes" 
            className="hidden" 
            accept=".json" 
            onChange={importNotes}
          />
          <Button variant="outline" size="sm" onClick={() => document.getElementById('import-notes')?.click()}>
            <Upload className="h-4 w-4 mr-1" /> Import
          </Button>
          <Button variant="outline" size="sm" onClick={exportNotes}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Note
          </Button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search notes..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex flex-1 space-x-4">
        {/* Notes List */}
        <div className="w-1/3 overflow-auto">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <StickyNote className="h-12 w-12 mb-2 opacity-20" />
              <p>No notes found</p>
              <Button 
                variant="outline" 
                className="mt-2" 
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Create Note
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotes.map(note => (
                <div 
                  key={note.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedNote?.id === note.id 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => {
                    setSelectedNote(note);
                    setIsEditMode(false);
                  }}
                >
                  <h3 className="font-medium truncate">{note.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                    {note.content.substring(0, 100)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Updated {formatDate(note.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Note Editor */}
        <div className="flex-1 border rounded-lg bg-white dark:bg-gray-800 overflow-hidden flex flex-col">
          {selectedNote ? (
            <>
              <div className="border-b p-3 flex items-center justify-between">
                {isEditMode ? (
                  <Input
                    value={selectedNote.title}
                    onChange={(e) => setSelectedNote({...selectedNote, title: e.target.value})}
                    className="text-lg font-medium"
                  />
                ) : (
                  <h3 className="text-lg font-medium">{selectedNote.title}</h3>
                )}
                
                <div className="flex items-center space-x-2">
                  {isEditMode ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleUpdateNote}
                    >
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditMode(true)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteNote(selectedNote.id)}
                  >
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 p-4">
                {isEditMode ? (
                  <textarea
                    value={selectedNote.content}
                    onChange={(e) => setSelectedNote({...selectedNote, content: e.target.value})}
                    className="w-full h-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <div className="whitespace-pre-wrap h-full overflow-y-auto">{selectedNote.content}</div>
                )}
              </div>
              
              <div className="border-t px-3 py-2 text-xs text-gray-500">
                Created: {formatDate(selectedNote.createdAt)} | 
                Last modified: {formatDate(selectedNote.updatedAt)}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <StickyNote className="h-16 w-16 mb-2 opacity-20" />
              <p>Select a note or create a new one</p>
              <Button 
                variant="outline" 
                className="mt-2" 
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Create Note
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Create Note Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                placeholder="Enter note title"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <textarea
                className="w-full p-2 border rounded-md resize-none h-40"
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                placeholder="Enter note content"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNote}>
              Create Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesApp;
