
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Folder, File, Plus, Trash, Edit, Save } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface FileExplorerProps {
  userId: string;
}

interface FileType {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  parentId: string | null;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ userId }) => {
  const [files, setFiles] = useState<FileType[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{id: string | null, name: string}[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file');
  const [isEditMode, setIsEditMode] = useState(false);
  const [fileContent, setFileContent] = useState('');
  
  // Load files from localStorage
  useEffect(() => {
    const storedFiles = JSON.parse(localStorage.getItem(`webOS_files_${userId}`) || '[]');
    setFiles(storedFiles);
    
    // Set initial folder path
    setFolderPath([{ id: null, name: 'Root' }]);
  }, [userId]);
  
  // Save files to localStorage when they change
  useEffect(() => {
    localStorage.setItem(`webOS_files_${userId}`, JSON.stringify(files));
  }, [files, userId]);
  
  const handleCreateItem = () => {
    if (!newItemName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the new item",
        variant: "destructive"
      });
      return;
    }
    
    // Check if name already exists in current folder
    const exists = files.some(f => 
      f.parentId === currentFolder && 
      f.name.toLowerCase() === newItemName.toLowerCase() &&
      f.type === newItemType
    );
    
    if (exists) {
      toast({
        title: "Item already exists",
        description: `A ${newItemType} with this name already exists in the current folder`,
        variant: "destructive"
      });
      return;
    }
    
    const newItem: FileType = {
      id: `${newItemType}-${Date.now()}`,
      name: newItemName,
      type: newItemType,
      parentId: currentFolder,
      content: newItemType === 'file' ? '' : undefined
    };
    
    setFiles([...files, newItem]);
    setIsCreateDialogOpen(false);
    setNewItemName('');
    
    toast({
      title: "Item created",
      description: `${newItemType} "${newItemName}" has been created successfully`,
    });
  };
  
  const handleDeleteItem = (item: FileType) => {
    // If folder, also delete all contents
    const itemsToDelete = [item.id];
    
    if (item.type === 'folder') {
      // Find all items that have this folder as parent (recursive)
      const findChildren = (parentId: string) => {
        files.forEach(file => {
          if (file.parentId === parentId) {
            itemsToDelete.push(file.id);
            if (file.type === 'folder') {
              findChildren(file.id);
            }
          }
        });
      };
      
      findChildren(item.id);
    }
    
    const updatedFiles = files.filter(file => !itemsToDelete.includes(file.id));
    setFiles(updatedFiles);
    
    toast({
      title: "Item deleted",
      description: `${item.type} "${item.name}" has been deleted`,
    });
  };
  
  const handleNavigateToFolder = (folderId: string | null, folderName: string) => {
    setCurrentFolder(folderId);
    
    if (folderId === null) {
      // Going to root
      setFolderPath([{ id: null, name: 'Root' }]);
    } else {
      // Check if we're going up or down
      const existingIndex = folderPath.findIndex(p => p.id === folderId);
      
      if (existingIndex >= 0) {
        // Going up - trim the path
        setFolderPath(folderPath.slice(0, existingIndex + 1));
      } else {
        // Going down - add to path
        setFolderPath([...folderPath, { id: folderId, name: folderName }]);
      }
    }
  };
  
  const handleOpenFile = (file: FileType) => {
    setSelectedFile(file);
    setFileContent(file.content || '');
    setIsEditMode(false);
  };
  
  const handleSaveFile = () => {
    if (!selectedFile) return;
    
    const updatedFiles = files.map(file => 
      file.id === selectedFile.id ? { ...file, content: fileContent } : file
    );
    
    setFiles(updatedFiles);
    setIsEditMode(false);
    
    toast({
      title: "File saved",
      description: `"${selectedFile.name}" has been saved successfully`,
    });
  };
  
  const currentFiles = files.filter(file => file.parentId === currentFolder);
  
  return (
    <div className="flex h-full">
      {/* File Browser */}
      <div className="w-full h-full flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center space-x-1">
            {folderPath.map((folder, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span>/</span>}
                <Button 
                  variant="ghost" 
                  className="h-6 px-1 text-sm" 
                  onClick={() => handleNavigateToFolder(folder.id, folder.name)}
                >
                  {folder.name}
                </Button>
              </React.Fragment>
            ))}
          </div>
          <Button 
            size="sm" 
            onClick={() => {
              setIsCreateDialogOpen(true);
              setNewItemName('');
              setNewItemType('file');
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        </div>
        
        {/* Files and Folders */}
        <div className="flex-1 p-2 overflow-auto">
          {currentFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Folder className="w-16 h-16 mb-2 opacity-20" />
              <p>No items in this folder</p>
              <Button 
                variant="outline" 
                className="mt-2" 
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Create New Item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {currentFiles.map(item => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer group"
                  onDoubleClick={() => {
                    if (item.type === 'folder') {
                      handleNavigateToFolder(item.id, item.name);
                    } else {
                      handleOpenFile(item);
                    }
                  }}
                >
                  <div className="flex items-center">
                    {item.type === 'folder' ? (
                      <Folder className="w-5 h-5 mr-2 text-blue-500" />
                    ) : (
                      <File className="w-5 h-5 mr-2 text-gray-500" />
                    )}
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="hidden group-hover:flex">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-6 h-6" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item);
                      }}
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* File Editor */}
      {selectedFile && (
        <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <File className="w-5 h-5 mr-2" />
                {selectedFile.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">
                File
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditMode(!isEditMode)}
              >
                {isEditMode ? (
                  <>
                    <Save className="w-4 h-4 mr-1" /> Save
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </>
                )}
              </Button>
            </div>
            
            {isEditMode ? (
              <textarea
                className="w-full h-[300px] p-2 border rounded-md font-mono text-sm"
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
              />
            ) : (
              <div className="w-full h-[300px] p-2 border rounded-md font-mono text-sm overflow-auto whitespace-pre">
                {fileContent || '(Empty file)'}
              </div>
            )}
            
            <DialogFooter>
              {isEditMode && (
                <Button onClick={handleSaveFile}>
                  Save Changes
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Create New Item Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New {newItemType === 'file' ? 'File' : 'Folder'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant={newItemType === 'file' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setNewItemType('file')}
              >
                <File className="w-4 h-4 mr-2" /> File
              </Button>
              <Button
                variant={newItemType === 'folder' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setNewItemType('folder')}
              >
                <Folder className="w-4 h-4 mr-2" /> Folder
              </Button>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name:
              </label>
              <Input
                id="name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="col-span-3"
                placeholder={`Enter ${newItemType} name`}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateItem}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileExplorer;
